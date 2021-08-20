import { Injectable } from '@nestjs/common';
import Knex = require("knex")
import { NestjsKnexService } from 'nestjs-knexjs';


@Injectable()
export class UserService {
    private readonly knex: Knex = null;

    constructor(private nestjsKnexService: NestjsKnexService){
        this.knex = this.nestjsKnexService.getKnexConnection();
    }
}
