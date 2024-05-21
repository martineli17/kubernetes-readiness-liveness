import { DataSource, Equal, Or, Repository } from "typeorm";
import { SettingsModel } from "../models/settings.model";
// import { AppDataSource } from "../settings/database.config";
import { SettingsSchema } from "../schemas/settings.schema";
import { Injectable, Scope } from "@nestjs/common";

@Injectable({scope: Scope.REQUEST })
export class SettingsDataGateway {
    private readonly _repository: Repository<SettingsModel>;

    constructor(dataSource: DataSource){
        this._repository = dataSource.getRepository<SettingsModel>(SettingsSchema);
    }

    public async getStartSettingsAsync(): Promise<boolean>{
        const settings = await this._repository.findOne({
            where: {
                start: Or(Equal(true), Equal(false))
            }
        });

        return settings.start;
    }

    public async getLiveSettingsAsync(): Promise<boolean>{
        const settings = await this._repository.findOne({
            where: {
                live: Or(Equal(true), Equal(false))
            }
        });

        return settings.live;
    }
}