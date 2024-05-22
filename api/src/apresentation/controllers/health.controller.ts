import { Controller, Get, Res } from "@nestjs/common";
import { Response } from "express";
import { SettingsDataGateway } from "src/infra/data/gateways/settings.gateway";

@Controller("health")
export class HealthController {
    constructor(private _repository: SettingsDataGateway) {

    }

    @Get("readiness")
    async readiness(@Res() response: Response) {
        const readiness = await this._repository.getReadinessSettingsAsync();
        console.log("READINESS: ", readiness);

        if (readiness)
            response.status(200).json({ status: "success" });
        else
            response.status(400).json({ status: "failed" })
    }

    @Get("liveness")
    async liveness(@Res() response: Response) {
        const liveness = await this._repository.getLivessSettingsAsync();
        console.log("LIVENESS: ", liveness);

        if (liveness)
            response.status(200).json({ status: "success" });
        else
            response.status(400).json({ status: "failed" })
    }
}