// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.
import type { AuthData } from './AuthData';
import type { CoreConstants } from './CoreConstants';
import type { InstanceConfig } from './InstanceConfig';
import type { PartialUser } from './PartialUser';
import type { StaffMember } from './StaffMember';
import type { TargetType } from './TargetType';

export interface Hello {
	instance_config: InstanceConfig;
	auth_data: AuthData;
	user: PartialUser;
	staff_member: StaffMember;
	core_constants: CoreConstants;
	target_types: Array<TargetType>;
}
