import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Session } from './session';


export const GetSession = createParamDecorator(
    async (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<Request&{ session: unknown }>();
        if (!(request.session instanceof Session)) {
            throw new UnauthorizedException({ message: "Se requiere autenticación." });
        }
        return request.session;
    },
);