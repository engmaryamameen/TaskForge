export enum EventType {
  // Auth
  USER_REGISTERED = 'user.registered',

  // Organizations
  ORGANIZATION_CREATED = 'organization.created',

  // Members
  MEMBER_INVITED = 'member.invited',
  MEMBER_JOINED = 'member.joined',

  // Invites
  INVITE_CREATED = 'invite.created',

  // Projects
  PROJECT_CREATED = 'project.created',
  PROJECT_UPDATED = 'project.updated',
  PROJECT_DELETED = 'project.deleted',

  // Tasks
  TASK_CREATED = 'task.created',
  TASK_UPDATED = 'task.updated',
  TASK_DELETED = 'task.deleted',
}
