import { DataSource, Equal, Or, Repository } from "typeorm";
import { SettingsModel } from "../models/settings.model";
import { SettingsSchema } from "../schemas/settings.schema";
import { Injectable, Scope } from "@nestjs/common";

@Injectable({scope: Scope.REQUEST })
export class SettingsDataGateway {
    private readonly _repository: Repository<SettingsModel>;

    constructor(dataSource: DataSource){
        this._repository = dataSource.getRepository<SettingsModel>(SettingsSchema);
    }

    public async getReadinessSettingsAsync(): Promise<boolean>{
        const settings = await this._repository.findOne({
            where: {
                readiness: Or(Equal(true), Equal(false))
            }
        });

        return settings.readiness;
    }

    public async getLivessSettingsAsync(): Promise<boolean>{
        const settings = await this._repository.findOne({
            where: {
                liveness: Or(Equal(true), Equal(false))
            }
        });

        return settings.liveness;
    }
}