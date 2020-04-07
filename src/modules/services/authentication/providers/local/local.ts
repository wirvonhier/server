import { Request, RequestHandler } from 'express-serve-static-core';
import * as Joi from 'joi';
import { User } from 'persistance/models';
import { tokenService as ts } from 'modules/services';
import { hashingService as hs } from 'modules/services';
import { IAuthResponse, ILocalRegisterBody } from '../../authService.types';
import { DataProtStatement } from 'persistance/models';
import { mailService } from 'modules/services';
// import { getEmailSubject, getEmailBody } from 'modules/services/authentication';

export async function register(req: Request): Promise<IAuthResponse> {
  const schema = Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
    dataProtStatement: Joi.string().required(),
    dataProtStatementLang: Joi.string().allow(['en', 'de']).required(),
  });
  const { error, value } = Joi.validate<ILocalRegisterBody>(req.body, schema);
  if (error) {
    return { error: { status: 406, message: error.details[0].message } };
  }
  const dataProtStatement = await DataProtStatement.findOne({
    version: value.dataProtStatement,
    language: value.dataProtStatementLang,
  });

  if (!dataProtStatement) {
    return { error: { status: 406, message: 'Invalid Data-Protection statement Id.' } };
  }
  const { email, password } = value;
  const user = await User.findOne({ email });
  if (user) return { error: { status: 406, message: 'User already exists.' } };
  const newUser = await User.create({ email, password, acceptedDataProtStatements: [dataProtStatement._id] });

  // Send confirmation Email
  // mailService.send({
  //   to: newUser.email,
  //   from: 'info',
  //   subject: getEmailSubject('local', 'register', newUser),
  //   html: getEmailBody('local', 'register', newUser),
  // });

  // Authentication Token
  const token = ts.generateToken({ id: newUser.id, email: newUser.email, roles: newUser.roles });

  return { token };
}

export const login: RequestHandler = async function login(req): Promise<IAuthResponse> {
  const schema = Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  });
  const { error } = Joi.validate<{ email: string; password: string }>(req.body, schema);
  if (error) {
    return { error: { status: 406, message: error.details[0].message } };
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return { error: { status: 406, message: 'Email or password incorrect.' } };

  if (!hs.checkPassword(password, user.password))
    return { error: { status: 406, message: 'Email or password incorrect.' } };

  const token = ts.generateToken({ id: user.id, email: user.email, roles: user.roles });
  return { token };
};

export async function forgotPassword(req: Request): Promise<{ status: number; message?: string }> {
  const schema = Joi.object().keys({
    email: Joi.string().required(),
  });
  const { error, value } = Joi.validate<{ email: string }>(req.body, schema);
  if (error) {
    return { status: 406, message: error.details[0].message };
  }
  const { email } = value;
  const user = await User.findOne({ email });
  if (!user) {
    return {
      status: 400,
      message: `No user found with e-mail address: ${email}.`,
    };
  }
  mailService.sendForgotPasswordMail(user);
  return {
    status: 204,
  };
}
