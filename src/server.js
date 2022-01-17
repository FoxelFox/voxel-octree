class headers{
    middleware(config){
        return async (ctx,next)=>{
            ctx.response.set("Cross-Origin-Opener-Policy", "same-origin");
            ctx.response.set("Cross-Origin-Embedder-Policy", "require-corp");
            await next();
        }
    }
}

module.exports = headers;