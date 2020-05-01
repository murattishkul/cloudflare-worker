addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * 
 * @param {Request} request
 */

class ElementHandler {
  constructor(group){
    this.mygroup =  group.charAt(0).toUpperCase() + group.slice(1)
  }
  element(element) {
    if(element.tagName === 'h1')
      element.setInnerContent(`You are under AB Testing. Your group is ${this.mygroup}`)
    else if(element.tagName === 'p')
      element.setInnerContent(`Welcome to Murat's Worker page. This is variant ${this.mygroup === 'Control' ? 'two' : 'one' } of the take home project! Yeah boy!`)
    else if(element.tagName === 'title')
      element.setInnerContent(`Murat's Variant #${this.mygroup === 'Control' ? '2' : '1' }`)
    else if(element.tagName === 'a' ){
      element.setInnerContent(`Go to Murat's ${this.mygroup === 'Control' ? 'LinkedIn' : 'Github' } page!`)
      element.setAttribute('href', `${this.mygroup === 'Control' ? 'https://linkedin.com/in/murattishkul' : 'https://github.com/murattishkul' }`)
    }
  }
}


async function handleRequest(request) {
  const NAME = 'MURAT_AB_TEST'

  const res = await fetch('https://cfw-takehome.developers.workers.dev/api/variants')
  const data = await res.json()

  const TEST_RESPONSE = await fetch(data.variants[0].toString())
  const CONTROL_RESPONSE = await fetch(data.variants[1].toString())

  const cookie = request.headers.get('cookie')
  let response, group
  if (cookie && cookie.includes(`${NAME}=control`)) {
    response = CONTROL_RESPONSE
    group = 'control'
  } else if (cookie && cookie.includes(`${NAME}=test`)) {
    response = TEST_RESPONSE
    group = 'test'
  } else {
    group = Math.random() < 0.5 ? 'test' : 'control' // no cookie -> new client
    response = group === 'control' ? CONTROL_RESPONSE : TEST_RESPONSE
    response = new Response(response.body, response)
    response.headers.append('Set-Cookie', `${NAME}=${group}; path=/`)
  }
  let handler = new ElementHandler(group)
  return new HTMLRewriter()
    .on('h1', handler)
    .on('p', handler)
    .on('a', handler)
    .on('title', handler)
    .transform(response)
}
