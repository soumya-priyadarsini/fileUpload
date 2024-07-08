const path = require('path')
const fs = require('fs');
const moment = require('moment');
const cassandra = require('cassandra-driver');
const PlainTextAuthProvider = cassandra.auth.PlainTextAuthProvider;

const cassCredDeatails = {
    contactPoints: ['34.93.148.99'],
    localDataCenter: 'datacenter1',
    keyspace: 'aeps',
    authProvider: new PlainTextAuthProvider('iserveuadmin', '#$%&434isuallpermissons@12198'),
    protocolOptions: { port: 9042 }
};

const cassandraClient = new cassandra.Client(cassCredDeatails);

cassandraClient.connect().then(success => {
    console.log("Cassandra Connected");
}).catch(err => {
    console.log("Cassandra Connection Error", err);
});

exports.fileUpload = async (req, res) => {
    return new Promise((resolve,reject)=>{
    if (!req.file) {
        return res.status(400).send({ message: 'No file uploaded' });
    }
    console.log(req.file.filename)
    // const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
    console.log(req.file.filename)
    fs.readFile(`./uploads/${req.file.filename}`, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        const lines = data.split('\n');
      
        let initial = 0;
        let count = lines.length;
        let sucData = [];
        let failData = [];

        const start = () => {
            if (initial < count) {
                let line = lines[initial];
                let data1 = line.split('|');
                const cleanedLine = data1.filter((value) => value !== 'Y' && value !== '' && value.trim() !== '');
           
                if (cleanedLine.length === 0) {
                    initial += 1;
                    start();
                    return;
                }
              

                const [agent_id, terminal_id, valid_from, valid_to, onboard_status, onboard_status_desc] = cleanedLine;
                const valid_from1 = moment(valid_from, 'DD/MM/YYYY').format('YYYY-MM-DD');
                const valid_to1 = moment(valid_to, 'DD/MM/YYYY').format('YYYY-MM-DD');
                const created_date = moment().format("YYYY-MM-DD HH:mm:ss");
                const updated_date = moment().format("YYYY-MM-DD HH:mm:ss");
                if (onboard_status == 'S') {
                    let query = `INSERT into neo_agent_onboarding_status (agent_id, created_date, onboard_status, onboard_status_desc, onboard_sub_status,
                    terminal_id, updated_date, valid_from, valid_to) VALUES ('${agent_id}', '${created_date}', '${onboard_status}', '${onboard_status_desc}', '0',
                    '${terminal_id}', '${updated_date}', '${valid_from1}', '${valid_to1}')`;

                    cassandraClient.execute(query).then((success) => {
                        console.log('Inserted successfully');
                        sucData.push(`${agent_id} Inserted`);
                        initial += 1;
                        start();
                    }).catch((error) => {
                        console.error('Cassandra execution error:', error);
                        failData.push(`${agent_id} not Inserted`);
                        initial += 1;
                        start();
                    });
                  
                } else {
                    failData.push(`${agent_id} not Inserted`);
                    initial += 1;
                    start();
                }
            } else {
                console.log('Process end');
                console.log("Successful agents:", sucData);
                console.log("Failed agents:", failData);
                resolve ({SUCCESS:sucData,FAILED:failData})
            }
        };
        start();
    });
})
};