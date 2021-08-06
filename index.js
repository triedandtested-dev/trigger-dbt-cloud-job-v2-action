const core = require('@actions/core');
const github = require('@actions/github');
const { copyFileSync } = require('fs');

const http = require('http');

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function trigger_job(token, account_id, job_id) {

  const postData = JSON.stringify({
    'cause': core.getInput('cause')
  });
  
  const jobRunOptions = {
    hostname: 'https://cloud.getdbt.com',
    port: 80,
    path: `/api/v2/accounts/${account_id}/jobs/${job_id}/run/`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  return new Promise((resolve, reject) => {
      const req = http.request(jobRunOptions, (response) => {
        let chunks_of_data = [];
    
        response.on('data', (fragments) => {
          chunks_of_data.push(fragments);
        });
    
        response.on('end', () => {
          let response_body = Buffer.concat(chunks_of_data);
          // promise resolved on success
          resolve(response_body.toString());
        });
    
        response.on('error', (error) => {
          // promise rejected on error
          reject(error);
        });
      req.on('error', (e) => {
        reject(e.message);
      });
      req.write(postData);
      req.end();
    });
  });
}

function get_job_run(token, account_id, run_id) {

  const runOptions = {
    hostname: 'https://cloud.getdbt.com',
    port: 80,
    path: `/api/v2/accounts/${account_id}/runs/${run_id}/`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(runOptions, (response) => {
      let chunks_of_data = [];
    
      response.on('data', (fragments) => {
        chunks_of_data.push(fragments);
      });
  
      response.on('end', () => {
        let response_body = Buffer.concat(chunks_of_data);
        // promise resolved on success
        resolve(response_body.toString());
      });
    
      response.on('error', (error) => {
        // promise rejected on error
        reject(error);
      });
      req.on('error', (e) => {
        reject(e.message);
      });
      req.end();
    });
  });
} 



trigger_job(
  token=core.getInput('dbt_cloud_token'), 
  account_id=core.getInput('dbt_cloud_account_id'), 
  job_id=core.getInput('dbt_cloud_job_id'))
  .then((res) => {
    const run_id = res.data.id;

    while (true) {
      const run_status = await get_job_run(token=core.getInput('dbt_cloud_token'), account_id=core.getInput('dbt_cloud_account_id'), run_id=run_id);
      if (run_status.data.finished_at) {
        if (run_status.data.status_message != 'Success') {
          core.setFailed(run_status.data);
        }
      }

      sleep(60 * 1000);
    }

  })
  .error((e) => {
    core.setFailed(e.message);
  });
