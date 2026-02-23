import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Eye,
  Code,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { adminApi } from '../../../api/admin.api';
import Spinner from '../../../components/ui/Spinner';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  tags?: string[];
  isPublished: boolean;
  author?: { name?: string; email?: string };
  createdAt: string;
}

interface BlogFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  tags: string;
  isPublished: boolean;
}

const emptyForm: BlogFormData = {
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  tags: '',
  isPublished: false,
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

export default function Blog() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [form, setForm] = useState<BlogFormData>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<BlogPost | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-blog', page],
    queryFn: () => adminApi.listBlogPosts(page),
  });

  const createMut = useMutation({
    mutationFn: (payload: any) => adminApi.createBlogPost(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-blog'] });
      closeModal();
      toast.success('Blog post created');
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed to create post'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      adminApi.updateBlogPost(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-blog'] });
      closeModal();
      toast.success('Blog post updated');
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed to update post'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => adminApi.deleteBlogPost(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-blog'] });
      setDeleteConfirm(null);
      toast.success('Blog post deleted');
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed to delete post'),
  });

  useEffect(() => {
    if (!slugManuallyEdited) {
      setForm((prev) => ({ ...prev, slug: slugify(prev.title) }));
    }
  }, [form.title, slugManuallyEdited]);

  function openCreateModal() {
    setEditingPost(null);
    setForm(emptyForm);
    setSlugManuallyEdited(false);
    setModalOpen(true);
  }

  function openEditModal(post: BlogPost) {
    setEditingPost(post);
    setForm({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt ?? '',
      tags: post.tags?.join(', ') ?? '',
      isPublished: post.isPublished,
    });
    setSlugManuallyEdited(true);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingPost(null);
    setForm(emptyForm);
    setSlugManuallyEdited(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim() || !form.content.trim()) {
      toast.error('Title, slug, and content are required');
      return;
    }

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      content: form.content.trim(),
      excerpt: form.excerpt.trim() || undefined,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      isPublished: form.isPublished,
    };

    if (editingPost) {
      updateMut.mutate({ id: editingPost.id, payload });
    } else {
      createMut.mutate(payload);
    }
  }

  const totalPages = data ? Math.ceil((data.total ?? 0) / 20) : 1;
  const posts: BlogPost[] = data?.posts ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Blog</h1>
          <p className="text-muted text-sm mt-1">
            {data?.total ?? 0} blog posts
          </p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
          New Post
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <Spinner />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl border border-b-border overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-b-border">
                  {['Title', 'Slug', 'Status', 'Author', 'Created', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-b-border">
                {posts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted text-sm">
                      No blog posts yet. Create your first post to get started.
                    </td>
                  </tr>
                )}
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-surface transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center text-muted">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                          {post.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-dim font-mono">/{post.slug}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      {post.isPublished ? (
                        <Badge label="Published" variant="green" />
                      ) : (
                        <Badge label="Draft" variant="gray" />
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-muted">
                      {post.author?.name ?? post.author?.email ?? '--'}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-dim">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(post)}
                          className="p-1.5 text-dim hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(post)}
                          className="p-1.5 text-dim hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-b-border">
              <span className="text-xs text-dim">
                Page {page} / {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 text-dim hover:text-foreground disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 text-dim hover:text-foreground disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingPost ? 'Edit Blog Post' : 'Create Blog Post'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full input-base rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-dim"
              placeholder="My awesome blog post"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Slug
            </label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => {
                setSlugManuallyEdited(true);
                setForm((f) => ({ ...f, slug: e.target.value }));
              }}
              className="w-full input-base rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-dim font-mono"
              placeholder="my-awesome-blog-post"
            />
            <p className="text-xs text-dim mt-1">Auto-generated from title. Edit to customize.</p>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Excerpt
            </label>
            <input
              type="text"
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              className="w-full input-base rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-dim"
              placeholder="A short summary of the post..."
            />
          </div>

          {/* Content with Markdown Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-foreground">
                Content (Markdown)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewMode(false)}
                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${!previewMode ? 'bg-blue-500 text-white' : 'text-muted hover:text-foreground'}`}
                >
                  <Code className="w-3 h-3 inline mr-1" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode(true)}
                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${previewMode ? 'bg-blue-500 text-white' : 'text-muted hover:text-foreground'}`}
                >
                  <Eye className="w-3 h-3 inline mr-1" />
                  Preview
                </button>
              </div>
            </div>
            {!previewMode ? (
              <textarea
                rows={12}
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                className="w-full input-base rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-dim resize-y font-mono"
                placeholder="# My Blog Post\n\nWrite your content in **Markdown** format...\n\n- List item 1\n- List item 2"
              />
            ) : (
              <div className="w-full min-h-[300px] input-base rounded-xl px-4 py-2.5 text-sm text-foreground prose prose-sm max-w-none">
                <ReactMarkdown>{form.content || '*No content yet*'}</ReactMarkdown>
              </div>
            )}
            <p className="text-xs text-dim mt-1">Supports Markdown: **bold**, *italic*, # headings, - lists, etc.</p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Tags
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              className="w-full input-base rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-dim"
              placeholder="feature, release, tutorial (comma-separated)"
            />
          </div>

          {/* Published Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, isPublished: !f.isPublished }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                form.isPublished ? 'bg-emerald-500' : 'bg-surface border border-b-border'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  form.isPublished ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-sm text-foreground">
              {form.isPublished ? 'Published' : 'Draft'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={closeModal} type="button">
              Cancel
            </Button>
            <Button
              className="flex-1"
              type="submit"
              loading={createMut.isPending || updateMut.isPending}
            >
              {editingPost ? 'Save Changes' : 'Create Post'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Blog Post"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Are you sure you want to delete{' '}
            <span className="font-medium text-foreground">
              {deleteConfirm?.title}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setDeleteConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              loading={deleteMut.isPending}
              onClick={() => deleteConfirm && deleteMut.mutate(deleteConfirm.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
