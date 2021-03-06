/*
 * Copyright (c) 2020. This code created and belongs to Atlas render manager project.
 * Owner and project architect: Danil Andreev | danssg08@gmail.com |  https://github.com/DanilAndreev
 * Project: atlas-core
 * File last modified: 11/12/20, 5:25 PM
 * All rights reserved.
 */

import {
    BaseEntity,
    Column, CreateDateColumn,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany, ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm";
import User from "./User";
import RenderJob from "./RenderJob";
import Role from "./Role";
import OrganizationLog from "./OrganizationLog";
import Plugin from "./Plugin";
import Slave from "./Slave";
import {Moment} from "moment";

/**
 * Organization - typeorm entity for organization data.
 * @class
 * @author Denis Afendikov
 */
@Entity()
export default class Organization extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    name: string;

    @Column({type: "text", nullable: true})
    description: string;

    @ManyToOne(type => User)
    @JoinColumn()
    ownerUser: User;

    @OneToOne(type => Role, {nullable: true})
    @JoinColumn()
    defaultRole: Role;

    @ManyToMany(type => User, user => user.organizations)
    @JoinTable({
        name: "user_organizations"
    })
    users: User[];

    @ManyToMany(type => Slave, slave => slave.organizations)
    @JoinTable({
        name: "slaves_pool"
    })
    slaves: Slave[];

    @OneToMany(type => RenderJob, job => job.organization)
    jobs: RenderJob[];

    @OneToMany(type => Role, role => role.organization)
    roles: Role[];

    @OneToMany(type => OrganizationLog, log => log.organization)
    logs: OrganizationLog[];

    @OneToMany(type => Plugin, plugin => plugin.organization)
    plugins: Plugin[];


    @CreateDateColumn()
    createdAt: Moment;

    @UpdateDateColumn()
    updatedAt: Moment;
}
