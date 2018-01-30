
  CREATE TABLE "BOROO"."CMS_TEMP" 
   (	"ID" VARCHAR2(32 BYTE) DEFAULT SYS_GUID() NOT NULL ENABLE, 
	"NAME" NVARCHAR2(150) NOT NULL ENABLE, 
	"DESCR" NVARCHAR2(500), 
	"ISDELETED" NUMBER(1,0) DEFAULT 0 NOT NULL ENABLE, 
	"RCDATE" DATE NOT NULL ENABLE, 
	"RCTIME" TIMESTAMP (6) DEFAULT SYS_EXTRACT_UTC(SYSTIMESTAMP) NOT NULL ENABLE
   ) SEGMENT CREATION IMMEDIATE 
  PCTFREE 10 PCTUSED 40 INITRANS 1 MAXTRANS 255 NOCOMPRESS LOGGING
  STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1 BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "USERS" ;
 

  CREATE UNIQUE INDEX "BOROO"."CMS_TEMP_INDEX1" ON "BOROO"."CMS_TEMP" ("ID") 
  PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS 
  STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1 BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "USERS" ;
 

  CREATE INDEX "BOROO"."CMS_TEMP_INDEX2" ON "BOROO"."CMS_TEMP" ("NAME") 
  PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS 
  STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1 BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "USERS" ;
 

  CREATE INDEX "BOROO"."CMS_TEMP_INDEX3" ON "BOROO"."CMS_TEMP" ("RCDATE" DESC) 
  PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS 
  STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1 BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "USERS" ;
 

INSERT INTO CMS_TEMP (NAME,DESCR,ISDELETED,RCDATE)
VALUES ('my name', '????? ???????', 0, TO_DATE('2017-03-07 15:17:19', 'YYYY-MM-DD HH24:MI:SS'));

/*UTC timestamp field view as local date*/
SELECT ID,NAME,TO_CHAR(RCDATE, 'YYYY-MM-DD HH24:MI:SS') as DATETIME,RCTIME as UTC
,TO_CHAR(FROM_TZ(RCTIME, 'UTC') at LOCAL, 'YYYY-MM-DD HH24:MI:SSxFF6') as local
FROM CMS_TEMP;

/*UTC without TZH:TZM*/
SELECT SYSTIMESTAMP as local, SYS_EXTRACT_UTC(SYSTIMESTAMP) as utc, TO_CHAR(SYS_EXTRACT_UTC(SYSTIMESTAMP), 'YYYY-MM-DD HH24:MI:SSxFF6') as str from dual;