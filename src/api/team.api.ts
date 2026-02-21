import api from './client';

export interface PermissionPayload {
  resource: string;
  canView: boolean;
  canEdit: boolean;
}

export interface InviteMemberPayload {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  permissions?: PermissionPayload[];
}

export const teamApi = {
  listMembers: () =>
    api.get('/team/members').then((r) => r.data),

  invite: (data: InviteMemberPayload) =>
    api.post('/team/invite', data).then((r) => r.data),

  removeMember: (id: string) =>
    api.delete(`/team/members/${id}`).then((r) => r.data),

  updateRole: (id: string, role: string) =>
    api.patch(`/team/members/${id}/role`, { role }).then((r) => r.data),

  getPermissions: (id: string) =>
    api.get(`/team/members/${id}/permissions`).then((r) => r.data),

  updatePermissions: (id: string, permissions: PermissionPayload[]) =>
    api.put(`/team/members/${id}/permissions`, { permissions }).then((r) => r.data),
};
