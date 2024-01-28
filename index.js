const fs = require('fs')
const speedTest = require('speedtest-net')

const LOG_FILE = 'speed-log.csv'
const SEPERATOR = ';'
const SLEEP = 5 * 60 * 1000


// {
//   timestamp: 2020-06-17T07:39:50.000Z,
//   ping: { jitter: 4.417, latency: 39.992 },
//   download: { bandwidth: 5802073, bytes: 53152140, elapsed: 9314 },
//   upload: { bandwidth: 1227173, bytes: 15968568, elapsed: 15002 },
//   packetLoss: 0,
//   isp: 'Deutsche Telekom AG',
//   interface: {
//     internalIp: '192.168.2.116',
//     name: 'en14',
//     macAddr: '58:EF:68:80:1C:0D',
//     isVpn: false,
//     externalIp: '93.252.251.245'
//   },
//   server: {
//     id: 17137,
//     name: 'Cronon GmbH',
//     location: 'Berlin',
//     country: 'DE',
//     host: 'warp.cronon.net',
//     port: 8080,
//     ip: '85.215.8.60'
//   },
//   result: {
//     id: '305cdc93-ac2a-4a17-bd8b-5a9f579cf34f',
//     url: 'https://www.speedtest.net/result/c/305cdc93-ac2a-4a17-bd8b-5a9f579cf34f'
//   }
// }

function saveResult(row) {
	if (!fs.existsSync(LOG_FILE)) {
		const fields = [
			'timestamp',
            'ping_jitter',
            'ping_latency',
            'download',
            'upload',
            'server_id',
            'server_ip',
            'result_url',
		].join(SEPERATOR)
		fs.writeFileSync(LOG_FILE, `${fields}\n`, { encoding: 'utf8' })
	}
	fs.appendFileSync(LOG_FILE, `${row}\n`, { encoding: 'utf8' })
}

function transformResult(result) {
    const row = []
    row.push(result.timestamp)
    row.push(result.ping.jitter)
    row.push(result.ping.latency)
    row.push(result.download.bandwidth)
    row.push(result.upload.bandwidth)
    row.push(result.server.id)
    row.push(result.server.ip)
    row.push(result.result.url)
    return row.join(SEPERATOR)
}

function saveError(message) {
    const row = []
    row.push((new Date().toISOString()))
    row.push(message)
    saveResult(row.join(SEPERATOR))
}

async function sleep(){
    return new Promise((resolve) => {
        setTimeout(resolve, SLEEP)
    })
}

(async () => {
    while (true) {
        try {
            const result = await speedTest({
                acceptLicense: true,
                acceptGdpr: true,
            })
            const row = transformResult(result)
            saveResult(row)
            console.log(result.timestamp, result.download.bandwidth, result.upload.bandwidth)
            await sleep()
        } catch (err) {

            console.log(err.message)
        }
    }
})()
