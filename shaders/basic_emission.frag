precision highp float;
uniform mat4 CC_PMatrix;
uniform mat4 CC_MVMatrix;
uniform mat4 CC_MVPMatrix;
uniform vec4 CC_Time;
uniform vec4 CC_SinTime;
uniform vec4 CC_CosTime;
uniform vec4 CC_Random01;
//CC INCLUDES END

											
#ifdef GL_ES								
precision lowp float;						
#endif										
											
uniform vec4 u_emission;				    
varying vec4 v_fragmentColor;				
varying vec2 v_texCoord;					
uniform sampler2D CC_Texture0;				
											
void main()									
{											
	vec4 c = v_fragmentColor * texture2D(CC_Texture0, v_texCoord);			
	c.rgb += u_emission.rgb*c.a;            
	gl_FragColor = c;                       
}
