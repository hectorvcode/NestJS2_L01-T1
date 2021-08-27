import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import * as jwt from 'jwt-simple';

const SUPER_SECRET_KEY = 'clave super secreta';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    if(!request.headers.bearer){
      return false;
    }

    const token = request.headers.bearer.split(' ')[1];

    try{
      const payload = jwt.decode(token, SUPER_SECRET_KEY);
      console.log(token);
    } catch (err) {
      Logger.error(err.message);
      return false;
    }
    console.log(token);
    

    //console.log(request, response);
    
    return true;
  }
}
