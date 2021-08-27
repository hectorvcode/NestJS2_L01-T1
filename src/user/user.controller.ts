import { Body, Controller, Get, HttpStatus, Logger, Post, Res, UseGuards } from '@nestjs/common';
import { JoiPassword } from "joi-password";
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Knex from 'knex';
import { NestjsKnexService } from 'nestjs-knexjs';
import * as bcrypt from 'bcrypt';
import { AuthGuard } from 'src/auth.guard';
import * as moment from 'moment';
import * as jwt from 'jwt-simple';

enum gender {
    MALE = 'male',
    FEMALE = 'female'
  }

  const SUPER_SECRET_KEY = 'clave super secreta';
  
  const Joi = require('joi').extend(require('@joi/date'));

  const schema = Joi.object({
    name: Joi.string().required(),
    lastName: Joi.string().required(),
    email:  Joi.string().email({minDomainSegments:2}).required(),
    password: JoiPassword.string()
              .minOfSpecialCharacters(1)
              .minOfLowercase(1)
              .minOfNumeric(1)
              .min(8),
    gender: Joi.string().valid('male', 'female'),
    birthDate: Joi.date()
  })

  const schemaLogin = Joi.object({
    email:  Joi.string().email({minDomainSegments:2}).required(),
    password: JoiPassword.string()
              .minOfSpecialCharacters(1)
              .minOfLowercase(1)
              .minOfNumeric(1)
              .min(8),
  })

@Controller('user')
export class UserController {

    private readonly knex: Knex = null;

    constructor(private nestjsKnexService: NestjsKnexService){
        this.knex = this.nestjsKnexService.getKnexConnection();
    }

    @Get()
    @UseGuards(new AuthGuard())
    public async get(@Res() response: Response){
        const tableData = await this.knex('user').select('*');
        return response.status(HttpStatus.OK).send({ tableData });
    }

    @Post('login')
    public async login(@Body() body: any, @Res() response: Response){
        try{
            console.log(body);
            const result = schemaLogin.validate(body);
            if(result.error){
                return response
                .status(HttpStatus.BAD_REQUEST)
                .send({ error: result.error })
            }

            const queryResult = await this.knex('user').where({ email: body.email });
            if(!queryResult.length){
                return response
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .send({ error: 'user of password invalid' });
            }

            const user = queryResult[0];

            const isValidPassword = bcrypt.compareSync(body.password, user.password);
            if(!isValidPassword){
                return response
                .status(HttpStatus.BAD_REQUEST)
                .send({ error: 'email or password invalid' })
            }

            const token = this.createToken(user);
            user.token = token;
            const queryLastConnection =  await this.knex('connection').where({ user_id: user.id });
            console.log({ queryLastConnection });

            user.lastConnection = (!queryLastConnection.length) 
                ? 'Hola por primera vez' 
                    : queryLastConnection[0].last_connection;
            
            const newConnection = {
                user_id: user.id,
                last_connection: 'hoy'
            }
            const updateResult = await this.knex('connection').update(newConnection)
                .where({ user_id:user.id });
            

            //console.log(user);
            delete user.password;

            return response.status(HttpStatus.OK).send({ user });
            

        } catch (err) {
            return response
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .send({ error: err.message });
        }
    }

    private createToken(user){
        const payload = {
            email: user.email,
            mensajePlay: 'holi',
            sub: user.id,
            iat: moment().unix(),
            exp: moment().add(1, 'days').unix()};
            return  jwt.encode(payload, SUPER_SECRET_KEY);
    }

    
    @Post()
    public async post(@Body() body: any, @Res() response: Response){
        try{
            const result = schema.validate(body);
            console.log('body', body);
            Logger.log({ result });
            if (result.error){
                return response.status(HttpStatus.BAD_REQUEST).send({
                    error: 'Invalid request body'
                });
            }

            const id = uuidv4();

            const password = body.password;
            const saltRounds = 10;
            const salt = bcrypt.genSaltSync(saltRounds);
            const hashedPassword = bcrypt.hashSync(password, salt);



            const userData = {
                id,
                name: body.name ,
                lastName: body.lastName,
                email:  body.email,
                password: hashedPassword,
                gender: body.gender,
                birthDate: body.birthDate
            };

            await this.knex('user').insert(userData);

            return response.status(HttpStatus.CREATED).send({ userData })

        } catch(err) {
            return response
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .send({ error: err.message })
        }
    }
}
