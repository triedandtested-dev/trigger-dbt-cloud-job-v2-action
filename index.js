const core = require('@actions/core');
const github = require('@actions/github');
const { copyFileSync } = require('fs');

const http = require('http');

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
} 

const postData = JSON.stringify({
  'cause': core.getInput('cause')
});

const jobRunOptions = {
  hostname: 'https://cloud.getdbt.com',
  port: 80,
  path: `/api/v2/accounts/${core.getInput('dbt_cloud_account_id')}/jobs/${core.getInput('dbt_cloud_job_id')}/run/`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${core.getInput('dbt_cloud_token')}`
  }
};

const req = http.request(jobRunOptions, (res) => {

  console.log(`STATUS: ${res.statusCode}`);
  
  res.on('data', (chunk) => {

    const runOptions = {
      hostname: 'https://cloud.getdbt.com',
      port: 80,
      path: `/api/v2/accounts/${core.getInput('dbt_cloud_account_id')}/runs/${chunk.id}/`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${core.getInput('dbt_cloud_token')}`
      }
    };

    while (true) {
      const response = await http.request(runOptions).end();
      if (response.body.finished_at) {
        if (response.body.status_message == 'Success') {
          core.setOutput('status', 'Success');
          return;
        }
        core.setFailed(response.body.status_message);
        return;
      }
      await sleep(1000);
    }

    
  });

  res.on('end', () => {
    console.log('No more data in response.');
  });

});

req.on('error', (e) => {
  core.setFailed(e.message);
});
req.write(postData);
req.end();

// try {
//   // `who-to-greet` input defined in action metadata file
//   const nameToGreet = core.getInput('who-to-greet');
//   console.log(`Hello ${nameToGreet}!`);
//   const time = (new Date()).toTimeString();
//   core.setOutput("time", time);
//   // Get the JSON webhook payload for the event that triggered the workflow
//   const payload = JSON.stringify(github.context.payload, undefined, 2)
//   console.log(`The event payload: ${payload}`);
// } catch (error) {
//   core.setFailed(error.message);
// }