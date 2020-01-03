"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
function arg(name, value) {
    if (!value) {
        throw new Error(`Argument '${name}' has an empty value`);
    }
    return [name, value];
}
function argFromEnvArray(name, envVars) {
    let args = [];
    for (const e of envVars) {
        if (e === '') {
            continue;
        }
        args = args.concat(name, `${e}=${process.env[e] || ''}`);
    }
    return args;
}
exports.argFromEnvArray = argFromEnvArray;
function dockerVersion() {
    return __awaiter(this, void 0, void 0, function* () {
        yield exec.exec('docker', ['--version']);
    });
}
function dockerLogin(username, password) {
    return __awaiter(this, void 0, void 0, function* () {
        core.setSecret(password);
        yield exec.exec('docker', [
            'login',
            '-u',
            username,
            '-p',
            password,
            core.getInput('registry')
        ]);
    });
}
function dockerBuild(args) {
    return __awaiter(this, void 0, void 0, function* () {
        yield exec.exec('docker', ['build', ...args]);
    });
}
function dockerPush(tag) {
    return __awaiter(this, void 0, void 0, function* () {
        yield exec.exec('docker', ['push', tag]);
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const username = core.getInput('username');
        const password = core.getInput('password');
        const tag = [core.getInput('registry'), core.getInput('tag')].join(':');
        yield dockerVersion();
        if (username && password) {
            yield dockerLogin(username, password);
        }
        yield dockerBuild([
            ...arg('-f', core.getInput('dockerfile')),
            ...arg('-t', tag),
            ...argFromEnvArray('--build-arg', core.getInput('build_args').split(',')),
            core.getInput('build_context')
        ]);
        yield dockerPush(tag);
    });
}
if (process.env.GITHUB_ACTIONS) {
    run().catch(e => core.setFailed(e.toString()));
}
