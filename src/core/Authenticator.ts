/*
 * Copyright (c) 2020. This code created and belongs to Atlas render manager project.
 * Owner and project architect: Danil Andreev | danssg08@gmail.com |  https://github.com/DanilAndreev
 * Project: atlas-core
 * File last modified: 11/12/20, 5:25 PM
 * All rights reserved.
 */

import * as Koa from "koa";
import {Context, Next} from "koa";
import * as cryptoRandomString from "crypto-random-string";
import * as Jwt from "koa-jwt";
import * as jsonwebtoken from "jsonwebtoken";
import {Moment} from "moment";
import * as moment from "moment";
import UserJwt from "./../interfaces/UserJwt";
import Server from "./Server";
import {REDIS_USER_JWT_PRIVATE_KEY} from "../globals";
import {promisify} from "util";


export interface JwtOptions {
    /**
     * expires - expiration timestamp of the token.
     */
    expires?: Moment;
}

export default class Authenticator {
    /**
     * jwtMiddleware - Jwt middleware.
     */
    protected static jwtMiddleware: Koa.Middleware = null;

    /**
     * init - initializes Authenticator.
     * @method
     * @author Danil Andreev
     */
    public static init() {
        Authenticator.jwtMiddleware = Jwt({
            secret: Authenticator.secretLoader,
            isRevoked: Authenticator.checkTokenRevoked,
        }).unless({path: [/^\/login/, "/users", "/version"]});
    }

    /**
     * secretLoader - JWT key loader for koa-jwt middleware generator.
     * @method
     * @param header - Request header
     * @param payload - Request payload
     * @author Danil Andreev
     */
    protected static async secretLoader(header: any, payload: any): Promise<string> {
        return await Authenticator.getKey();
    }

    /**
     * getKey - gets JWT private key from Redis.
     * If key is not defined in Redis - it will create new key and save it to Redis.
     * @method
     * @author Danil Andreev
     */
    public static async getKey() {
        let key: string = "";
        try {
            key = await new Promise<string>((resolve, reject) => {
                const client = Server.getCurrent().getRedis();
                client.get(REDIS_USER_JWT_PRIVATE_KEY, (error, response) => {
                    if (error) {
                        reject(error);
                    } else {
                        if (response) {
                            resolve(response);
                        } else {
                            reject(new TypeError("Value is null!"));
                        }
                    }
                });
            });
        } catch (error) {
            console.log("Authenticator: JWT Key is missing on Redis. Generating new one.");
            const key: string = cryptoRandomString({length: 30, type: "base64"});
            Server.getCurrent().getRedis().set(REDIS_USER_JWT_PRIVATE_KEY, key);
        }
        return key;
    }

    /**
     * checkTokenRevoked - returns false when token is not revoked and true if it is.
     * @method
     * @param ctx - Context
     * @param decodedToken - Decoded jwt token
     * @param token - Raw jwt token
     */
    protected static async checkTokenRevoked(ctx: Context, decodedToken: UserJwt, token: string): Promise<boolean> {
        // TODO
        return false;
    }

    /**
     * getJwtMiddleware - returns Jwt middleware for Koa.
     * @method
     * @author Danil Andreev
     */
    public static getJwtMiddleware(): Koa.Middleware {
        return this.jwtMiddleware;
    }

    /**
     * createJwt - creates token from payload.
     * @method
     * @param data - Data to encrypt. Payload.
     * @param options - Additional options.
     * @author Danil Andreev
     */
    public static async createJwt(data: object, options: JwtOptions = {}): Promise<string> {
        const createdAt: Moment = moment();
        if (options?.expires < createdAt)
            throw new RangeError(`Authenticator: "expires" can not be less than "createdAt"`);
        const expires: Moment = options.expires ? options.expires.add(1, "hour") : createdAt.add(1, "hour");
        const token: string = jsonwebtoken.sign({
            ...data,
            expires: expires.format(),
            createdAt: createdAt.format()
        }, await Authenticator.getKey());
        return token;
    }
}
