var gameConfig = {
    refundRate: 0.75,
    /*
     * difficulty: 'easy', 'intermediate', 'hard'
     * ....
     */
    selectShader: 'green_tint',
    connectingShader: 'purple_tint',


    shaders: {
        green_tint: [
            `vec4 vert(vec3 pos, vec2 uv, vec4 color) {
                return def_vert();
            }`,
            `vec4 frag(vec3 pos, vec2 uv, vec4 color, sampler2D tex) {
                return def_frag() * vec4(0, 1, 0, 1);
            }`
        ],
        purple_tint: [
            `vec4 vert(vec3 pos, vec2 uv, vec4 color) {
                return def_vert();
            }`,
            `vec4 frag(vec3 pos, vec2 uv, vec4 color, sampler2D tex) {
                return def_frag() * vec4(0.75, 0, 0.4, 0.9);
            }`
        ]
    }
};

export default gameConfig;