export default async function* report(source) {
  for await (const event of source) {
    if (['test:pass', 'test:fail', 'test:summary'].includes(event.type)) {
      const { name, file, nesting, details, success, counts, duration_ms } = event.data;
      yield JSON.stringify({type:event.type,name,file,nesting,duration_ms:details?.duration_ms??duration_ms,success,counts})+'\n';
    }
  }
}
