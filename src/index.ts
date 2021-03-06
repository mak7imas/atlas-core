/*
 * Copyright (c) 2020. This code created and belongs to Atlas render manager project.
 * Owner and project architect: Danil Andreev | danssg08@gmail.com |  https://github.com/DanilAndreev
 * Project: atlas-core
 * File last modified: 11/12/20, 5:25 PM
 * All rights reserved.
 */

import * as dotenv from "dotenv";


dotenv.config();

import "globals";

import Server from "./core/Server";

// Controllers
import UsersController from "./controllers/UsersController";
import LoginController from "./controllers/LoginController";
import OrganizationsController from "./controllers/OrganizationsController";
import UserTokensController from "./controllers/UserTokensController";
//import * as config from "./config.json";
import {config} from "./config";
import JobController from "./controllers/JobController";
import JobsProcessor from "./processors/JobsProcessor";
import VersionsController from "./controllers/VersionsController";
import TaskReportsProcessor from "./processors/TaskReportsProcessor";
import UploadController from "./controllers/UploadController";
import PluginController from "./controllers/PluginController";


async function startServer() {
    const server = await Server.createServer(config);
    await JobsProcessor();
    await TaskReportsProcessor();

    server.useController(new UsersController());
    server.useController(new LoginController());
    server.useController(new OrganizationsController());
    server.useController(new UserTokensController());
    server.useController(new JobController());
    server.useController(new VersionsController());
    server.useController(new UploadController());
    server.useController(new PluginController());
    server.start();
}

startServer().then();
