import { Body, Controller, Get, HttpStatus, Logger, Post, Res } from '@nestjs/common';
import { JoiPassword } from "joi-password";
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

enum gender {
    MALE = 'male',
    FEMALE = 'female'
  }
  
  const Joi = require('joi').extend(require('@joi/date'));

  const schema = Joi.object({
    name: Joi.string().required(),
    lastName: Joi.string().required(),
    email:  Joi.string().email({minDomainSegments:2}).required(),
    password: JoiPassword.string()
              .minOfSpecialCharacters(1)
              .minOfLowercase(1)
              .minOfNumeric(2)
              .min(8),
    gender: Joi.string().valid('male', 'female'),
    birthDate: Joi.date().format('DD-MM-YYYY')
  })

@Controller('user')
export class UserController {
    
    @Post('insertUser')
    public post(@Body() body: any, @Res() response: Response){
        try{
            const result = schema.validate(body);
            console.log('body', body);
            Logger.log({ result });
            if (result.error){
                return response.status(HttpStatus.BAD_REQUEST).send({
                    error: 'Invalid request body'
                });
            }

            const newUser = {
                ...body,
                id: uuidv4()
            }

            return response.status(HttpStatus.CREATED).send({ newUser })

        } catch(err) {
            return response
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .send({ error: 'Server error' })
        }
    }
}
