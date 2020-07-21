# Bauta options

Bauta has some options that may be set up at instantation of the micro service time. 


##### truncateLogSize

Type: `number`\
Default: `3200`

Indicates the size after which bauta truncates the logs.



##### disableTruncateLog

Type: `boolean`\
Default: `false`

Indicates if the truncation of the logs is disabled. Avoid setting this to true in production, this is a utility though for troubleshooting development issues.
