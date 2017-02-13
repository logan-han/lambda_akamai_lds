CREATE EXTERNAL TABLE IF NOT EXISTS akamai.sharpie (
`timestamp` string,
`csip` string,
`csmethod` string,
`sslversion` string,
`csuri` string,
`scstatus` string,
`sccontentbytes` string,
`sctotalbytes` string,
`sobjectsize` string,
`suncompressedsize` string,
`httpoverheadbytes` string,
`referer` string,
`useragent` string,
`cookie` string,
`host` string,
`contenttype` string,
`xtimessloverheadms` string,
`xtimeturnaroundms` string,
`xtimetransferms` string,
`xrequestid` string,
`xmaxage` string,
`xcachestatus` string,
`xcacherefreshsource` string,
`xlastbyteservedflag` string,
`xnostoreflag` string,
`edgeip` string
)
ROW FORMAT SERDE  'org.apache.hadoop.hive.serde2.OpenCSVSerde'
WITH SERDEPROPERTIES (
  "separatorChar" = "\t",
  "quoteChar"     = "\""
) LOCATION 's3://bucket_name_and_path_here/'
TBLPROPERTIES (
  "skip.header.line.count"="2");
