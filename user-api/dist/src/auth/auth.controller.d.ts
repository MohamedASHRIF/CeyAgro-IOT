import { UserService } from '../../src/user/user.service';
import { SnsService } from '../../src/sns/sns.service';
export declare class AuthController {
    private userService;
    private snsService;
    private readonly logger;
    constructor(userService: UserService, snsService: SnsService);
    handleLogin(body: {
        email: string;
        name: string;
    }): Promise<{
        message: string;
        isSubscribed: boolean;
    }>;
    confirmSubscription(body: {
        email: string;
    }): Promise<{
        message: string;
    }>;
}
