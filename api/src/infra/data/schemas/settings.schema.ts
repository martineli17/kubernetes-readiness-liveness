import { EntitySchema } from "typeorm";
import { SettingsModel } from "../models/settings.model";

export const SettingsSchema = new EntitySchema<SettingsModel>({
    name: "settings",
    columns: {
        liveness: {
            type: "boolean",
            nullable: false,
            default: false,
            primary: true,
        },
        readiness: {
            type: "boolean",
            nullable: false,
            default: false,
            primary: true,
        }
    }
});