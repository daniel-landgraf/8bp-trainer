precision highp float;
precision mediump int;
uniform mat4 CC_MVPMatrix;
attribute vec4 a_color;
attribute vec2 a_texCoord;
attribute vec4 a_position;
varying vec4 v_fragmentColor;
varying vec2 v_texCoord;

void main()
{
gl_Position = CC_MVPMatrix * a_position;
v_fragmentColor = a_color;
v_texCoord = a_texCoord;
}
