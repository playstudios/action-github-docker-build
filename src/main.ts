import * as core from '@actions/core'
import * as exec from '@actions/exec'

function arg(name: string, value: string): string[] {
  if (!value) {
    throw new Error(`Argument '${name}' has an empty value`)
  }
  return [name, value]
}

function argFromEnvArray(name: string, envVars: string[]): string[] {
  let args: string[] = []
  for (const e of envVars) {
    args = args.concat(name, `${e}="${process.env[e] || ''}"`)
  }
  return args
}

async function dockerVersion(): Promise<void> {
  await exec.exec('docker', ['--version'])
}

async function dockerLogin(username: string, password: string): Promise<void> {
  core.setSecret(password)
  await exec.exec('docker', [
    'login',
    '-u',
    username,
    '-p',
    password,
    core.getInput('registry')
  ])
}

async function dockerBuild(args: string[]): Promise<void> {
  await exec.exec('docker', ['build', ...args])
}

async function dockerPush(tag: string): Promise<void> {
  await exec.exec('docker', ['push', tag])
}

async function run(): Promise<void> {
  const username = core.getInput('username')
  const password = core.getInput('password')
  const tag = [core.getInput('registry'), core.getInput('tag')].join(':')

  await dockerVersion()
  if (username && password) {
    await dockerLogin(username, password)
  }
  await dockerBuild([
    ...arg('-f', core.getInput('dockerfile')),
    ...arg('-t', tag),
    ...argFromEnvArray('--build-arg', core.getInput('build_args').split(',')),
    core.getInput('build_context')
  ])
  await dockerPush(tag)
}

if (process.env.GITHUB_ACTIONS) {
  run().catch(e => core.setFailed(e.toString()))
}
