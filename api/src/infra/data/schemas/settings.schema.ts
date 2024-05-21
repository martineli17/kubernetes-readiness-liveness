import { EntitySchema } from "typeorm";
import { SettingsModel } from "../models/settings.model";

export const SettingsSchema = new EntitySchema<SettingsModel>({
    name: "settings",
    columns: {
        live: {
            type: "boolean",
            nullable: false,
            default: false,
            primary: true,
        },
        start: {
            type: "boolean",
            nullable: false,
            default: false,
            primary: true,
        }
    }
});