import { createApp } from "../src/app.js";
import { assertRequiredProductionConfig } from "../src/config/env.js";

assertRequiredProductionConfig();

export default createApp();
