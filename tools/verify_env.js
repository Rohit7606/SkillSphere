const dns = require('dns').promises;

async function testDns() {
  const resolver = new dns.Resolver();
  resolver.setServers(['8.8.8.8', '1.1.1.1']);
  try {
    const cname = await resolver.resolveCname('api-inference.huggingface.co');
    console.log('CNAME:', cname);
    for (const target of cname) {
      try {
        const ips = await resolver.resolve4(target);
        console.log(`IPs for ${target}:`, ips);
      } catch (err) {
        console.error(`Failed to resolve target ${target}:`, err.message);
      }
    }
  } catch (err) {
    console.error('Failed to resolve:', err.message || err);
  }
}

testDns();
