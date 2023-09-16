export function mimeLookup(file: string) {
	const matches = (pattern: string) => pattern.split(" ").some(x => file.endsWith(`.${x}`));

	if (matches("html htm shtml")) return "text/html";
	if (matches("css")) return "text/css";
	if (matches("xml")) return "text/xml";
	if (matches("gif")) return "image/gif";
	if (matches("jpeg jpg")) return "image/jpeg";
	if (matches("js")) return "application/x-javascript";
	if (matches("atom")) return "application/atom+xml";
	if (matches("rss")) return "application/rss+xml";
	
	if (matches("mml")) return "text/mathml";
	if (matches("txt")) return "text/plain";
	if (matches("jad")) return "text/vnd.sun.j2me.app-descriptor";
	if (matches("wml")) return "text/vnd.wap.wml";
	if (matches("htc")) return "text/x-component";
	
	if (matches("png")) return "image/png";
	if (matches("tif tiff")) return "image/tiff";
	if (matches("wbmp")) return "image/vnd.wap.wbmp";
	if (matches("ico")) return "image/x-icon";
	if (matches("jng")) return "image/x-jng";
	if (matches("bmp")) return "image/x-ms-bmp";
	if (matches("svg")) return "image/svg+xml";
	if (matches("webp")) return "image/webp";
	
	if (matches("jar war ear")) return "application/java-archive";
	if (matches("hqx")) return "application/mac-binhex40";
	if (matches("doc")) return "application/msword";
	if (matches("pdf")) return "application/pdf";
	if (matches("ps eps ai")) return "application/postscript";
	if (matches("rtf")) return "application/rtf";
	if (matches("xls")) return "application/vnd.ms-excel";
	if (matches("ppt")) return "application/vnd.ms-powerpoint";
	if (matches("wmlc")) return "application/vnd.wap.wmlc";
	if (matches("kml")) return "application/vnd.google-earth.kml+xml";
	if (matches("kmz")) return "application/vnd.google-earth.kmz";
	if (matches("7z")) return "application/x-7z-compressed";
	if (matches("cco")) return "application/x-cocoa";
	if (matches("jardiff")) return "application/x-java-archive-diff";
	if (matches("jnlp")) return "application/x-java-jnlp-file";
	if (matches("run")) return "application/x-makeself";
	if (matches("pl pm")) return "application/x-perl";
	if (matches("prc pdb")) return "application/x-pilot";
	if (matches("rar")) return "application/x-rar-compressed";
	if (matches("rpm")) return "application/x-redhat-package-manager";
	if (matches("sea")) return "application/x-sea";
	if (matches("swf")) return "application/x-shockwave-flash";
	if (matches("sit")) return "application/x-stuffit";
	if (matches("tcl tk")) return "application/x-tcl";
	if (matches("der pem crt")) return "application/x-x509-ca-cert";
	if (matches("xpi")) return "application/x-xpinstall";
	if (matches("xhtml")) return "application/xhtml+xml";
	if (matches("zip")) return "application/zip";
	
	if (matches("bin exe dll")) return "application/octet-stream";
	if (matches("deb")) return "application/octet-stream";
	if (matches("dmg")) return "application/octet-stream";
	if (matches("eot")) return "application/octet-stream";
	if (matches("iso img")) return "application/octet-stream";
	if (matches("msi msp msm")) return "application/octet-stream";
	
	if (matches("mid midi kar")) return "audio/midi";
	if (matches("mp3")) return "audio/mpeg";
	if (matches("ogg")) return "audio/ogg";
	if (matches("ra")) return "audio/x-realaudio";
	
	if (matches("3gpp 3gp")) return "video/3gpp";
	if (matches("mpeg mpg")) return "video/mpeg";
	if (matches("mov")) return "video/quicktime";
	if (matches("flv")) return "video/x-flv";
	if (matches("mng")) return "video/x-mng";
	if (matches("asx asf")) return "video/x-ms-asf";
	if (matches("wmv")) return "video/x-ms-wmv";
	if (matches("avi")) return "video/x-msvideo";
	if (matches("m4v mp4")) return "video/mp4";

	return "application/octet-stream";
}
