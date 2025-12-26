const fs = require('fs');
const path = require('path');
const infile = process.argv[2] || path.join(__dirname,'..','docs','api','swagger.json');
const outfile = process.argv[3] || path.join(__dirname,'..','tests','postman_collection.json');
const swagger = JSON.parse(fs.readFileSync(infile,'utf8'));

const info = swagger.info || { title: 'API', version: '1.0.0' };
const servers = swagger.servers || [{ url: 'http://localhost:3000' }];
const baseUrl = servers[0].url.replace(/\/$/,'');

function makeExampleFromSchema(schema){
  if(!schema) return {};
  if(schema.example !== undefined) return schema.example;
  if(schema.type === 'object'){
    const out = {};
    const props = schema.properties || {};
    Object.keys(props).forEach(k=>{
      out[k] = makeExampleFromSchema(props[k]);
    });
    return out;
  }
  if(schema.type === 'array'){
    return [ makeExampleFromSchema(schema.items) ];
  }
  if(schema.type === 'string') return schema.format === 'date' || schema.format === 'date-time' ? new Date().toISOString() : 'string';
  if(schema.type === 'integer' || schema.type === 'number') return 0;
  if(schema.type === 'boolean') return false;
  return null;
}

const collection = {
  info: {
    name: `${info.title} - generated from swagger.json`,
    description: info.description || '',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
  },
  item: [],
  variable: [ { key: 'baseUrl', value: baseUrl }, { key: 'token', value: '' } ]
};

const paths = swagger.paths || {};
for(const p of Object.keys(paths)){
  const pathItem = paths[p];
  for(const method of Object.keys(pathItem)){
    const op = pathItem[method];
    const name = (op.summary || `${method.toUpperCase()} ${p}`).replace(/\n/g,' ');
    const hasAuth = op.security && op.security.length>0;

    const request = {
      method: method.toUpperCase(),
      header: [],
      url: { raw: `{{baseUrl}}${p}`, host: ['{{baseUrl}}'], path: p.split('/').filter(Boolean).map(s=>s.replace(/^{|}$/g,'')) }
    };

    if(hasAuth){
      request.header.push({ key: 'Authorization', value: 'Bearer {{token}}' });
    }

    if(op.requestBody && op.requestBody.content && op.requestBody.content['application/json']){
      const schema = op.requestBody.content['application/json'].schema;
      const example = makeExampleFromSchema(schema);
      request.body = { mode: 'raw', raw: JSON.stringify(example, null, 2), options: { raw: { language: 'json' } } };
      request.header.push({ key: 'Content-Type', value: 'application/json' });
    }

    const item = { name, request };
    collection.item.push(item);
  }
}

fs.mkdirSync(path.dirname(outfile), { recursive: true });
fs.writeFileSync(outfile, JSON.stringify(collection, null, 2),'utf8');
console.log('Wrote', outfile);
