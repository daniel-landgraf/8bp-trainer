precision highp float;
precision mediump int;
uniform sampler2D CC_Texture0;
uniform mat4 CC_MVPMatrix;
varying vec4 v_fragmentColor;
varying vec2 v_texCoord;

void main()
{
vec4 f_fragmentColor = vec4(1.0);
f_fragmentColor.rgb = v_fragmentColor.rgb;
f_fragmentColor.a = v_fragmentColor.a * texture2D(CC_Texture0, v_texCoord).a;gl_FragColor = f_fragmentColor;
}
