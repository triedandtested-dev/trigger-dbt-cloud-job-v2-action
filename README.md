# Trigger DBT Cloud Job action

This action triggers a dbt cloud job using the dbt cloud api v2.

## Inputs

## `dbt_cloud_token`

**Required** DBT cloud api token.

## `dbt_cloud_account_id`

**Required** DBT cloud account id.

## `dbt_cloud_job_id`

**Required** DBT cloud job id.

## `cause`

**Optional** Cause message to use. Default `"Triggered from Github"`.

## `interval`

**Optional** The interval between polls in seconds. Default `30`.

## Example usage.
```
uses: triedandtested-dev/trigger-dbt-cloud-job-v2-action@v1.1
with:
  dbt_cloud_token: 'token' // consider using secrets.
  dbt_cloud_account_id: 'account id'
  dbt_cloud_job_id: 'job id'
  cause: 'Tiggered from my action'
  interval: 30
```
