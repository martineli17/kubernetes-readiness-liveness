import { Controller, Get, Res } from "@nestjs/common";
import { Response } from "express";
import { SettingsDataGateway } from "src/infra/data/gateways/settings.gateway";

@Controller("health")
export class HealthController {
    constructor(private _repository: SettingsDataGateway) {

    }

    @Get("readiness")
    async readiness(@Res() response: Response) {
        const ableToStart = await this._repository.getStartSettingsAsync();
        console.log("READINESS: ", ableToStart);

        if (ableToStart)
            response.status(200).json({ status: "success" });
        else
            response.status(400).json({ status: "failed" })
    }

    @Get("liveness")
    async liveness(@Res() response: Response) {
        const ableToKeep = await this._repository.getLiveSettingsAsync();
        console.log("LIVENESS: ", ableToKeep);

        if (ableToKeep)
            response.status(200).json({ status: "success" });
        else
            response.status(400).json({ status: "failed" })
    }
}