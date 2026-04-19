import { SetMetadata } from '@nestjs/common';

export const ORG_SCOPED_KEY = 'isOrgScoped';
export const OrgScoped = () => SetMetadata(ORG_SCOPED_KEY, true);
