--
-- PostgreSQL database dump
--

\restrict 0R5Ebh2741h89Vcd1jq5ANEpiLT2Sjfly9PfY8UMt1yYW2P4FX4yT0AEbxSGREX

-- Dumped from database version 15.17
-- Dumped by pg_dump version 15.17

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: audit_action; Type: TYPE; Schema: public; Owner: elisa_user
--

CREATE TYPE public.audit_action AS ENUM (
    'login',
    'logout',
    'submit_cleaning',
    'edit_cleaning',
    'qa_approve',
    'qa_reject',
    'generate_report',
    'add_machine',
    'edit_machine',
    'delete_machine',
    'add_part',
    'edit_part',
    'delete_part',
    'edit_floor_config',
    'add_user',
    'edit_user',
    'deactivate_user',
    'room_approved',
    'room_call_maintenance',
    'telegram_sent'
);


ALTER TYPE public.audit_action OWNER TO elisa_user;

--
-- Name: cleaning_status; Type: TYPE; Schema: public; Owner: elisa_user
--

CREATE TYPE public.cleaning_status AS ENUM (
    'draft',
    'submitted',
    'waiting_qa',
    'approved',
    'rejected'
);


ALTER TYPE public.cleaning_status OWNER TO elisa_user;

--
-- Name: floor_rule; Type: TYPE; Schema: public; Owner: elisa_user
--

CREATE TYPE public.floor_rule AS ENUM (
    'rolling',
    'hard_deadline'
);


ALTER TYPE public.floor_rule OWNER TO elisa_user;

--
-- Name: machine_type; Type: TYPE; Schema: public; Owner: elisa_user
--

CREATE TYPE public.machine_type AS ENUM (
    'RVS',
    'TOYO',
    'WB',
    'K1R',
    'TS',
    'DS',
    'MF'
);


ALTER TYPE public.machine_type OWNER TO elisa_user;

--
-- Name: notif_type; Type: TYPE; Schema: public; Owner: elisa_user
--

CREATE TYPE public.notif_type AS ENUM (
    'cleaning_submitted',
    'qa_approved',
    'qa_rejected',
    'room_warning',
    'room_approved'
);


ALTER TYPE public.notif_type OWNER TO elisa_user;

--
-- Name: qa_decision; Type: TYPE; Schema: public; Owner: elisa_user
--

CREATE TYPE public.qa_decision AS ENUM (
    'approved',
    'rejected'
);


ALTER TYPE public.qa_decision OWNER TO elisa_user;

--
-- Name: room_status; Type: TYPE; Schema: public; Owner: elisa_user
--

CREATE TYPE public.room_status AS ENUM (
    'ready',
    'warning',
    'out_of_spec'
);


ALTER TYPE public.room_status OWNER TO elisa_user;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: elisa_user
--

CREATE TYPE public.user_role AS ENUM (
    'admin',
    'operator',
    'qa',
    'site_head',
    'supervisor'
);


ALTER TYPE public.user_role OWNER TO elisa_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: areas; Type: TABLE; Schema: public; Owner: elisa_user
--

CREATE TABLE public.areas (
    id integer NOT NULL,
    area_name character varying(100) NOT NULL,
    floor integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT areas_floor_check CHECK (((floor >= 1) AND (floor <= 4)))
);


ALTER TABLE public.areas OWNER TO elisa_user;

--
-- Name: areas_id_seq; Type: SEQUENCE; Schema: public; Owner: elisa_user
--

CREATE SEQUENCE public.areas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.areas_id_seq OWNER TO elisa_user;

--
-- Name: areas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: elisa_user
--

ALTER SEQUENCE public.areas_id_seq OWNED BY public.areas.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: elisa_user
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    action public.audit_action NOT NULL,
    target_type character varying(50),
    target_id character varying(100),
    old_value jsonb,
    new_value jsonb,
    ip_address character varying(50),
    user_agent character varying(300),
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.audit_logs OWNER TO elisa_user;

--
-- Name: checklist_items; Type: TABLE; Schema: public; Owner: elisa_user
--

CREATE TABLE public.checklist_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    record_id uuid NOT NULL,
    stage_id integer NOT NULL,
    part_id uuid,
    part_name character varying(100) NOT NULL,
    jam_mulai time without time zone,
    jam_selesai time without time zone,
    durasi_menit integer,
    is_checked boolean DEFAULT false,
    keterangan character varying(20),
    notes text,
    signature_name character varying(100),
    signature_time timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.checklist_items OWNER TO elisa_user;

--
-- Name: checklist_parts; Type: TABLE; Schema: public; Owner: elisa_user
--

CREATE TABLE public.checklist_parts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    stage_id integer NOT NULL,
    part_name character varying(100) NOT NULL,
    machine_type public.machine_type NOT NULL,
    urutan integer DEFAULT 1,
    is_active boolean DEFAULT true,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.checklist_parts OWNER TO elisa_user;

--
-- Name: checklist_stages; Type: TABLE; Schema: public; Owner: elisa_user
--

CREATE TABLE public.checklist_stages (
    id integer NOT NULL,
    stage_name character varying(100) NOT NULL,
    urutan integer NOT NULL,
    is_active boolean DEFAULT true
);


ALTER TABLE public.checklist_stages OWNER TO elisa_user;

--
-- Name: checklist_stages_id_seq; Type: SEQUENCE; Schema: public; Owner: elisa_user
--

CREATE SEQUENCE public.checklist_stages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.checklist_stages_id_seq OWNER TO elisa_user;

--
-- Name: checklist_stages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: elisa_user
--

ALTER SEQUENCE public.checklist_stages_id_seq OWNED BY public.checklist_stages.id;


--
-- Name: cleaning_records; Type: TABLE; Schema: public; Owner: elisa_user
--

CREATE TABLE public.cleaning_records (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    machine_id uuid NOT NULL,
    area_id integer NOT NULL,
    operator_id uuid NOT NULL,
    cleaning_date date NOT NULL,
    cleaning_type character varying(50),
    produk_sebelumnya character varying(100),
    produk_sesudahnya character varying(100),
    waktu_mulai time without time zone,
    waktu_selesai time without time zone,
    durasi_menit integer,
    status public.cleaning_status DEFAULT 'draft'::public.cleaning_status,
    catatan text,
    telegram_sent boolean DEFAULT false,
    telegram_sent_at timestamp with time zone,
    submitted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.cleaning_records OWNER TO elisa_user;

--
-- Name: cleaning_schedule; Type: TABLE; Schema: public; Owner: elisa_user
--

CREATE TABLE public.cleaning_schedule (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    machine_id uuid NOT NULL,
    last_cleaned date,
    next_cleaning date,
    last_record_id uuid,
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.cleaning_schedule OWNER TO elisa_user;

--
-- Name: floor_config; Type: TABLE; Schema: public; Owner: elisa_user
--

CREATE TABLE public.floor_config (
    id integer NOT NULL,
    area_id integer NOT NULL,
    rule_type public.floor_rule DEFAULT 'hard_deadline'::public.floor_rule NOT NULL,
    window_start_days integer DEFAULT 30 NOT NULL,
    window_end_days integer DEFAULT 35 NOT NULL,
    overdue_after_days integer DEFAULT 35 NOT NULL,
    due_soon_from_day integer DEFAULT 5 NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.floor_config OWNER TO elisa_user;

--
-- Name: floor_config_id_seq; Type: SEQUENCE; Schema: public; Owner: elisa_user
--

CREATE SEQUENCE public.floor_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.floor_config_id_seq OWNER TO elisa_user;

--
-- Name: floor_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: elisa_user
--

ALTER SEQUENCE public.floor_config_id_seq OWNED BY public.floor_config.id;


--
-- Name: lines; Type: TABLE; Schema: public; Owner: elisa_user
--

CREATE TABLE public.lines (
    id integer NOT NULL,
    area_id integer NOT NULL,
    line_name character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.lines OWNER TO elisa_user;

--
-- Name: lines_id_seq; Type: SEQUENCE; Schema: public; Owner: elisa_user
--

CREATE SEQUENCE public.lines_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.lines_id_seq OWNER TO elisa_user;

--
-- Name: lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: elisa_user
--

ALTER SEQUENCE public.lines_id_seq OWNED BY public.lines.id;


--
-- Name: machine_parts; Type: TABLE; Schema: public; Owner: elisa_user
--

CREATE TABLE public.machine_parts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    machine_id uuid NOT NULL,
    part_code character varying(100) NOT NULL,
    part_name character varying(100) NOT NULL,
    urutan integer DEFAULT 1,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.machine_parts OWNER TO elisa_user;

--
-- Name: machines; Type: TABLE; Schema: public; Owner: elisa_user
--

CREATE TABLE public.machines (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    area_id integer NOT NULL,
    line_id integer,
    machine_code character varying(50) NOT NULL,
    machine_name character varying(100) NOT NULL,
    machine_type public.machine_type NOT NULL,
    sub_label character varying(100),
    is_active boolean DEFAULT true,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.machines OWNER TO elisa_user;

--
-- Name: qa_verifications; Type: TABLE; Schema: public; Owner: elisa_user
--

CREATE TABLE public.qa_verifications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    record_id uuid NOT NULL,
    qa_id uuid NOT NULL,
    decision public.qa_decision NOT NULL,
    remarks text,
    corrective_action text,
    report_url character varying(500),
    is_draft boolean DEFAULT true,
    verified_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.qa_verifications OWNER TO elisa_user;

--
-- Name: reports; Type: TABLE; Schema: public; Owner: elisa_user
--

CREATE TABLE public.reports (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    record_id uuid,
    report_name character varying(200) NOT NULL,
    report_type character varying(50),
    floor integer,
    start_date date,
    end_date date,
    report_url character varying(500),
    is_draft boolean DEFAULT true,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.reports OWNER TO elisa_user;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: elisa_user
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name public.user_role NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.roles OWNER TO elisa_user;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: elisa_user
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.roles_id_seq OWNER TO elisa_user;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: elisa_user
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: room_readiness_lembar_review; Type: TABLE; Schema: public; Owner: elisa_user
--

CREATE TABLE public.room_readiness_lembar_review (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    site character varying(100),
    area_id integer,
    param_suhu boolean DEFAULT true,
    param_rh boolean DEFAULT true,
    param_dp boolean DEFAULT false,
    periode character varying(50),
    date_start date,
    time_start time without time zone,
    date_end date,
    time_end time without time zone,
    suhu_min numeric(5,2),
    suhu_max numeric(5,2),
    suhu_avg numeric(5,2),
    suhu_syarat character varying(50),
    rh_min numeric(5,2),
    rh_max numeric(5,2),
    rh_avg numeric(5,2),
    rh_syarat character varying(50),
    reviewed_by_1 character varying(100),
    reviewed_by_2 character varying(100),
    reviewed_by_3 character varying(100),
    review_date date,
    notes text,
    submitted_by uuid,
    report_url character varying(500),
    submitted_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.room_readiness_lembar_review OWNER TO elisa_user;

--
-- Name: room_readiness_reviews; Type: TABLE; Schema: public; Owner: elisa_user
--

CREATE TABLE public.room_readiness_reviews (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    suhu_rh_id uuid NOT NULL,
    reviewed_by uuid NOT NULL,
    action character varying(50) NOT NULL,
    notes text,
    telegram_sent boolean DEFAULT false,
    reviewed_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.room_readiness_reviews OWNER TO elisa_user;

--
-- Name: suhu_rh; Type: TABLE; Schema: public; Owner: elisa_user
--

CREATE TABLE public.suhu_rh (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    machine_id uuid,
    line_id integer,
    tagname character varying(200) NOT NULL,
    description character varying(200),
    timestamp_start timestamp with time zone,
    timestamp_end timestamp with time zone,
    suhu numeric(5,2),
    rh numeric(5,2),
    status public.room_status DEFAULT 'ready'::public.room_status,
    synced_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.suhu_rh OWNER TO elisa_user;

--
-- Name: telegram_notifications; Type: TABLE; Schema: public; Owner: elisa_user
--

CREATE TABLE public.telegram_notifications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    record_id uuid,
    review_id uuid,
    notif_type public.notif_type NOT NULL,
    message_text text NOT NULL,
    is_sent boolean DEFAULT false,
    chat_id character varying(100),
    sent_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.telegram_notifications OWNER TO elisa_user;

--
-- Name: users; Type: TABLE; Schema: public; Owner: elisa_user
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    role_id integer NOT NULL,
    full_name character varying(150) NOT NULL,
    username character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    area character varying(100),
    is_active boolean DEFAULT true,
    last_login timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO elisa_user;

--
-- Name: areas id; Type: DEFAULT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.areas ALTER COLUMN id SET DEFAULT nextval('public.areas_id_seq'::regclass);


--
-- Name: checklist_stages id; Type: DEFAULT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.checklist_stages ALTER COLUMN id SET DEFAULT nextval('public.checklist_stages_id_seq'::regclass);


--
-- Name: floor_config id; Type: DEFAULT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.floor_config ALTER COLUMN id SET DEFAULT nextval('public.floor_config_id_seq'::regclass);


--
-- Name: lines id; Type: DEFAULT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.lines ALTER COLUMN id SET DEFAULT nextval('public.lines_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Data for Name: areas; Type: TABLE DATA; Schema: public; Owner: elisa_user
--

COPY public.areas (id, area_name, floor, created_at) FROM stdin;
1	Filling - Lantai 1	1	2026-04-09 06:12:14.553456+00
2	Compounding - Lantai 2	2	2026-04-09 06:12:14.553456+00
3	Compounding - Lantai 3	3	2026-04-09 06:12:14.553456+00
4	Compounding - Lantai 4	4	2026-04-09 06:12:14.553456+00
34	Filling - Lantai 1	1	2026-04-09 07:10:01.267114+00
35	Compounding - Lantai 2	2	2026-04-09 07:10:01.267114+00
36	Compounding - Lantai 3	3	2026-04-09 07:10:01.267114+00
37	Compounding - Lantai 4	4	2026-04-09 07:10:01.267114+00
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: elisa_user
--

COPY public.audit_logs (id, user_id, action, target_type, target_id, old_value, new_value, ip_address, user_agent, created_at) FROM stdin;
0bf6f819-5343-4ed3-acae-8c7b18f43aff	c3568848-1d93-49b6-80a9-cdb3018b556a	login	user	c3568848-1d93-49b6-80a9-cdb3018b556a	\N	\N	::1	\N	2026-04-09 08:44:06.344058+00
585122e8-cf85-4735-89d1-270f7bb5be17	e4c549ef-20f6-4710-bd46-decf486fbc5e	login	user	e4c549ef-20f6-4710-bd46-decf486fbc5e	\N	\N	::1	\N	2026-04-09 08:48:40.586787+00
359f574e-7cf9-4fe0-8bd9-7a9c2c337d03	2157fcac-e3a7-4981-8ffb-36fdec4fad61	login	user	2157fcac-e3a7-4981-8ffb-36fdec4fad61	\N	\N	::1	\N	2026-04-09 08:50:32.730782+00
53d6d791-6e54-4464-a70b-a57e06b69897	2157fcac-e3a7-4981-8ffb-36fdec4fad61	login	user	2157fcac-e3a7-4981-8ffb-36fdec4fad61	\N	\N	::1	\N	2026-04-10 02:43:42.851804+00
88d623f0-407e-47e3-94d5-7814a19388b3	2157fcac-e3a7-4981-8ffb-36fdec4fad61	login	user	2157fcac-e3a7-4981-8ffb-36fdec4fad61	\N	\N	::1	\N	2026-04-10 02:44:58.337897+00
81153345-e03a-4c26-be1f-b4835ce55c18	2157fcac-e3a7-4981-8ffb-36fdec4fad61	login	user	2157fcac-e3a7-4981-8ffb-36fdec4fad61	\N	\N	::1	\N	2026-04-10 02:50:39.738855+00
3c2de60d-1818-498d-8d2d-9c19fcd78068	2157fcac-e3a7-4981-8ffb-36fdec4fad61	login	user	2157fcac-e3a7-4981-8ffb-36fdec4fad61	\N	\N	::1	\N	2026-04-10 02:54:19.790898+00
cc4c301d-dde5-43ac-b622-9674f7ceaa50	2157fcac-e3a7-4981-8ffb-36fdec4fad61	login	user	2157fcac-e3a7-4981-8ffb-36fdec4fad61	\N	\N	::1	\N	2026-04-10 03:01:37.946246+00
557bcc98-5900-44a9-87ec-0555c4636071	2157fcac-e3a7-4981-8ffb-36fdec4fad61	login	user	2157fcac-e3a7-4981-8ffb-36fdec4fad61	\N	\N	::1	\N	2026-04-10 03:06:28.08482+00
2fd68aed-1f89-434b-9563-76cc2b466b39	2157fcac-e3a7-4981-8ffb-36fdec4fad61	login	user	2157fcac-e3a7-4981-8ffb-36fdec4fad61	\N	\N	::1	\N	2026-04-10 03:06:49.696421+00
f400a60f-fb0d-4254-a1c1-834a449e5692	2157fcac-e3a7-4981-8ffb-36fdec4fad61	login	user	2157fcac-e3a7-4981-8ffb-36fdec4fad61	\N	\N	::1	\N	2026-04-10 03:23:11.942623+00
b6ed1bad-04b2-4d90-b740-80a68ac1835a	2157fcac-e3a7-4981-8ffb-36fdec4fad61	login	user	2157fcac-e3a7-4981-8ffb-36fdec4fad61	\N	\N	::1	\N	2026-04-10 03:51:47.236389+00
c1afc94d-d2f0-41c9-b282-2b833b3ae445	2157fcac-e3a7-4981-8ffb-36fdec4fad61	login	user	2157fcac-e3a7-4981-8ffb-36fdec4fad61	\N	\N	::1	\N	2026-04-10 04:59:20.796612+00
314127da-b365-4dfe-a0e6-655a8ea8f0d7	2157fcac-e3a7-4981-8ffb-36fdec4fad61	login	user	2157fcac-e3a7-4981-8ffb-36fdec4fad61	\N	\N	::1	\N	2026-04-10 05:56:03.212533+00
17efae1d-4870-4ee3-a531-9b2ce6778669	2157fcac-e3a7-4981-8ffb-36fdec4fad61	login	user	2157fcac-e3a7-4981-8ffb-36fdec4fad61	\N	\N	::1	\N	2026-04-10 06:16:43.214729+00
ca8c1238-843c-4179-8e5e-d0b87cc862bd	2157fcac-e3a7-4981-8ffb-36fdec4fad61	login	user	2157fcac-e3a7-4981-8ffb-36fdec4fad61	\N	\N	::1	\N	2026-04-10 06:20:46.059416+00
829f55dc-3bad-48ea-89a0-8fd818927231	2157fcac-e3a7-4981-8ffb-36fdec4fad61	login	user	2157fcac-e3a7-4981-8ffb-36fdec4fad61	\N	\N	::1	\N	2026-04-10 06:22:24.289342+00
d8c1a5b6-e8f6-4c01-b70f-44d1aa033e4c	2157fcac-e3a7-4981-8ffb-36fdec4fad61	login	user	2157fcac-e3a7-4981-8ffb-36fdec4fad61	\N	\N	::1	\N	2026-04-10 06:32:55.131991+00
f019ae6f-da28-43c1-845f-a57121965a50	2157fcac-e3a7-4981-8ffb-36fdec4fad61	login	user	2157fcac-e3a7-4981-8ffb-36fdec4fad61	\N	\N	::1	\N	2026-04-10 06:37:56.022365+00
023b5195-368c-4091-8a59-3b57a14491f9	2157fcac-e3a7-4981-8ffb-36fdec4fad61	login	user	2157fcac-e3a7-4981-8ffb-36fdec4fad61	\N	\N	::1	\N	2026-04-10 06:38:30.416682+00
8bf9bd51-96c9-4266-8356-379f3cc4bc79	2157fcac-e3a7-4981-8ffb-36fdec4fad61	login	user	2157fcac-e3a7-4981-8ffb-36fdec4fad61	\N	\N	::1	\N	2026-04-10 06:53:44.410644+00
b64d0689-9d81-4a9b-921f-ad31f444c4d9	2157fcac-e3a7-4981-8ffb-36fdec4fad61	login	user	2157fcac-e3a7-4981-8ffb-36fdec4fad61	\N	\N	::1	\N	2026-04-10 06:55:57.437835+00
27835ac8-fa24-4356-a8a2-9f4923c18e6e	2157fcac-e3a7-4981-8ffb-36fdec4fad61	login	user	2157fcac-e3a7-4981-8ffb-36fdec4fad61	\N	\N	::1	\N	2026-04-10 07:14:30.590711+00
b9ec2cbe-65f5-474c-9eef-280f1e0bda7b	2157fcac-e3a7-4981-8ffb-36fdec4fad61	login	user	2157fcac-e3a7-4981-8ffb-36fdec4fad61	\N	\N	::1	\N	2026-04-10 07:17:25.974194+00
c382fa5e-c31e-4796-9d28-ad305684f8d4	2157fcac-e3a7-4981-8ffb-36fdec4fad61	login	user	2157fcac-e3a7-4981-8ffb-36fdec4fad61	\N	\N	::1	\N	2026-04-10 08:23:10.932616+00
a2fb7170-2824-47e7-8891-51bfc99ea37e	2157fcac-e3a7-4981-8ffb-36fdec4fad61	login	user	2157fcac-e3a7-4981-8ffb-36fdec4fad61	\N	\N	::1	\N	2026-04-10 08:28:42.16063+00
cae0d655-e9e6-4406-bb44-d4294fc17c57	2157fcac-e3a7-4981-8ffb-36fdec4fad61	login	user	2157fcac-e3a7-4981-8ffb-36fdec4fad61	\N	\N	::1	\N	2026-04-13 00:28:51.302825+00
\.


--
-- Data for Name: checklist_items; Type: TABLE DATA; Schema: public; Owner: elisa_user
--

COPY public.checklist_items (id, record_id, stage_id, part_id, part_name, jam_mulai, jam_selesai, durasi_menit, is_checked, keterangan, notes, signature_name, signature_time, created_at) FROM stdin;
\.


--
-- Data for Name: checklist_parts; Type: TABLE DATA; Schema: public; Owner: elisa_user
--

COPY public.checklist_parts (id, stage_id, part_name, machine_type, urutan, is_active, created_by, created_at, updated_at) FROM stdin;
dcc8176b-33fb-4aaa-9a61-2557b045e882	1	Chamber	RVS	1	t	\N	2026-04-09 07:10:02.4593+00	2026-04-09 07:10:02.4593+00
56a5a4e8-b178-4705-91fd-ef1ca78abf5a	1	Nozzle	RVS	2	t	\N	2026-04-09 07:10:02.4593+00	2026-04-09 07:10:02.4593+00
3df352fd-2efd-4ed8-ba59-2c0765d631bf	1	Auger	RVS	3	t	\N	2026-04-09 07:10:02.4593+00	2026-04-09 07:10:02.4593+00
751f54e1-50ce-49fb-96c2-afd5867f2bd7	1	Stirrer	RVS	4	t	\N	2026-04-09 07:10:02.4593+00	2026-04-09 07:10:02.4593+00
ce2a18b5-f199-42bc-9ca9-f29121bee2bf	1	Slider	RVS	5	t	\N	2026-04-09 07:10:02.4593+00	2026-04-09 07:10:02.4593+00
ec532868-97dc-4fe6-9211-f1766606d399	2	Chamber	RVS	1	t	\N	2026-04-09 07:10:02.4593+00	2026-04-09 07:10:02.4593+00
5d6fe407-baec-4a74-ad85-22a7e1c5db5b	2	Nozzle	RVS	2	t	\N	2026-04-09 07:10:02.4593+00	2026-04-09 07:10:02.4593+00
700f85ce-9d06-4fc8-8781-00e3e68e5dc5	2	Auger	RVS	3	t	\N	2026-04-09 07:10:02.4593+00	2026-04-09 07:10:02.4593+00
2748370b-a3bd-4cc8-bcc0-dfb017da6f02	2	Stirrer	RVS	4	t	\N	2026-04-09 07:10:02.4593+00	2026-04-09 07:10:02.4593+00
dfed4f2d-44ce-43f4-b73b-0f4f4798109a	2	Slider	RVS	5	t	\N	2026-04-09 07:10:02.4593+00	2026-04-09 07:10:02.4593+00
d78421f5-2e51-4211-a183-dcd575f73896	3	Chamber	RVS	1	t	\N	2026-04-09 07:10:02.4593+00	2026-04-09 07:10:02.4593+00
f280acab-731e-4a3a-85d7-d19135d79d08	3	Nozzle	RVS	2	t	\N	2026-04-09 07:10:02.4593+00	2026-04-09 07:10:02.4593+00
1c060282-9b9d-43df-9459-f999246d45bc	3	Auger	RVS	3	t	\N	2026-04-09 07:10:02.4593+00	2026-04-09 07:10:02.4593+00
b4381d50-f18c-412c-8f4c-fdfcd0bdae2d	3	Stirrer	RVS	4	t	\N	2026-04-09 07:10:02.4593+00	2026-04-09 07:10:02.4593+00
3a85e0ca-16fc-458d-b92d-344f9283fc58	3	Slider	RVS	5	t	\N	2026-04-09 07:10:02.4593+00	2026-04-09 07:10:02.4593+00
6a82dde2-18f9-448e-a246-2764af5b4ce6	4	Sealing	RVS	1	t	\N	2026-04-09 07:10:02.4593+00	2026-04-09 07:10:02.4593+00
aad82eec-dc91-4805-ac6e-87bb50ccb24e	4	No Batch Roller	RVS	2	t	\N	2026-04-09 07:10:02.4593+00	2026-04-09 07:10:02.4593+00
53e15de1-7a43-43f2-821b-1afb807fa039	4	Scraper	RVS	3	t	\N	2026-04-09 07:10:02.4593+00	2026-04-09 07:10:02.4593+00
89bd43b1-1d26-4f2d-b6ef-273802eaae8c	4	Crown	RVS	4	t	\N	2026-04-09 07:10:02.4593+00	2026-04-09 07:10:02.4593+00
7d510b54-db85-445a-bfc6-a4300c786fa1	4	Body Mesin	RVS	5	t	\N	2026-04-09 07:10:02.4593+00	2026-04-09 07:10:02.4593+00
6aa8c939-d3b5-4e59-a907-3099c333bf20	4	Conveyor	RVS	6	t	\N	2026-04-09 07:10:02.4593+00	2026-04-09 07:10:02.4593+00
651c015f-c21d-43a9-8d2a-641b6fdc9cc6	5	Flexible Hose	RVS	1	t	\N	2026-04-09 07:10:02.4593+00	2026-04-09 07:10:02.4593+00
74c70138-2bc8-4e03-91b2-2cc997033ce1	5	Chamber	RVS	2	t	\N	2026-04-09 07:10:02.4593+00	2026-04-09 07:10:02.4593+00
3cbe9293-04a1-4e7c-8625-2a01bd560c49	5	Nozzle	RVS	3	t	\N	2026-04-09 07:10:02.4593+00	2026-04-09 07:10:02.4593+00
2554a2f8-606a-458e-a950-6e81198c8da9	5	Auger	RVS	4	t	\N	2026-04-09 07:10:02.4593+00	2026-04-09 07:10:02.4593+00
d7d79804-b926-4fe1-a891-61b82c5ead86	5	Stirrer	RVS	5	t	\N	2026-04-09 07:10:02.4593+00	2026-04-09 07:10:02.4593+00
34ef5d26-e1a4-4ea9-b1a1-28e36b6d573e	5	Slider	RVS	6	t	\N	2026-04-09 07:10:02.4593+00	2026-04-09 07:10:02.4593+00
5dd1f222-cab1-4415-a999-2c6c26544d7b	5	Pipa After	RVS	7	t	\N	2026-04-09 07:10:02.4593+00	2026-04-09 07:10:02.4593+00
17fe7490-47a1-411f-a271-30df7900dae6	5	Flexible Hose After	RVS	8	t	\N	2026-04-09 07:10:02.4593+00	2026-04-09 07:10:02.4593+00
76f3c7c9-283e-4751-9a1b-f3157386beeb	6	Chamber	RVS	1	t	\N	2026-04-09 07:10:02.4593+00	2026-04-09 07:10:02.4593+00
65639edc-b4c0-4785-a3ab-eb59cc86aac1	6	Nozzle	RVS	2	t	\N	2026-04-09 07:10:02.4593+00	2026-04-09 07:10:02.4593+00
ffe93e4c-4cc1-43b4-9030-8748e37d0d1e	6	Auger	RVS	3	t	\N	2026-04-09 07:10:02.4593+00	2026-04-09 07:10:02.4593+00
ec9b3262-8cb6-444a-9e28-2e69556ff473	6	Stirrer	RVS	4	t	\N	2026-04-09 07:10:02.4593+00	2026-04-09 07:10:02.4593+00
bbfba4b7-b819-4338-bd96-8059234e4c75	6	Slider	RVS	5	t	\N	2026-04-09 07:10:02.4593+00	2026-04-09 07:10:02.4593+00
12ea789f-43d5-4db2-8492-e99949acac3d	7	Chamber	RVS	1	t	\N	2026-04-09 07:10:02.4593+00	2026-04-09 07:10:02.4593+00
d6a19e14-5fe2-4e33-bb7c-a88a184b03ec	7	Nozzle	RVS	2	t	\N	2026-04-09 07:10:02.4593+00	2026-04-09 07:10:02.4593+00
0937aafe-61ec-4f7e-b427-aa83121e41f1	7	Auger	RVS	3	t	\N	2026-04-09 07:10:02.4593+00	2026-04-09 07:10:02.4593+00
73c366ad-8f3f-4688-8e24-5fd2642a8342	7	Stirrer	RVS	4	t	\N	2026-04-09 07:10:02.4593+00	2026-04-09 07:10:02.4593+00
f2f6e015-e915-4ea4-ad7c-6bdaa58a6132	7	Slider	RVS	5	t	\N	2026-04-09 07:10:02.4593+00	2026-04-09 07:10:02.4593+00
41c0c173-3ebb-4158-81e3-90f595d339d1	1	Pipa Discharge	TOYO	1	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
834d58b0-d265-4692-8307-ae00cebeb2ed	1	Valve Limitter	TOYO	2	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
f4105025-5c50-4c7b-9bd9-f3e370987174	1	Flexible Hose	TOYO	3	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
51bb1944-25c5-4e1b-8cb9-5d01181a3ab8	1	Pipa After Flexible Hose	TOYO	4	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
39bdf05d-1d79-47cd-9aa9-367992cc45c4	1	Hopper	TOYO	5	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
3c2938d1-337a-4dfc-8cf7-1157ad810e6a	1	Rotary Feeder	TOYO	6	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
1b1a1c58-d6d4-4acd-aa70-6b7c627bf46b	1	Subhopper	TOYO	7	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
883cb93a-37ef-40d7-857e-9fa944fc43d1	1	Filling Shutte	TOYO	8	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
9dee5535-49a4-4dc9-96da-8847dae2db87	2	Pipa Discharge	TOYO	1	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
a7d25cb3-804a-417d-9d38-9c87fe578e24	2	Valve Limitter	TOYO	2	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
c7cb37d5-74f7-44aa-8386-873875d8b347	2	Flexible Hose	TOYO	3	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
50c0d7e6-9206-4e60-b01b-11e13a4c7309	2	Pipa After Flexible Hose	TOYO	4	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
b881b55a-8bca-4105-9306-d7f7c2f490f0	2	Hopper	TOYO	5	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
6a0ac215-dda3-4bbf-8e96-c2732e3233eb	2	Rotary Feeder	TOYO	6	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
899a91cc-f36c-4223-a3b4-7fc25b5beac8	2	Subhopper	TOYO	7	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
8f3e963c-98f3-4a7e-9728-2f9c3517a796	2	Filling Shutte	TOYO	8	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
45cf3606-81cb-4d86-b00c-d6ac08926473	3	Pipa Discharge	TOYO	1	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
2d447427-548b-4e8c-ad68-b002a94b3e7a	3	Valve Limitter	TOYO	2	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
ddb16468-f19d-45ed-9dfd-956f2bab82a4	3	Flexible Hose	TOYO	3	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
8bbc8b7a-c662-4bb8-b435-fe91b742e0f3	3	Pipa After Flexible Hose	TOYO	4	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
4d331732-bfd3-422d-b8a1-7db70d60ac49	3	Hopper	TOYO	5	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
d0986a42-d4dd-46b9-89ba-23bdbf3ae211	3	Rotary Feeder	TOYO	6	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
d0908f17-99ff-41b6-8a12-f7c9f85a1d91	3	Subhopper	TOYO	7	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
01489d47-24cf-42df-996d-b87b738c80d8	3	Filling Shutte	TOYO	8	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
5ae58c01-4197-4a9c-a2e7-9d01d85d6ad7	4	Sealing	TOYO	1	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
d0b987ea-b8c3-4bb3-a4a1-0f9e3fd9b0a4	4	No Batch Roller	TOYO	2	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
a704eb29-45b3-4912-ad44-c6ca548f6199	4	Cross Knife	TOYO	3	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
0ec30069-08a7-4302-8aec-29fed8d463b5	4	Body Mesin	TOYO	4	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
7da307da-0e81-43de-a912-12a2b615775a	4	Transverse Feed Dust Collector	TOYO	5	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
9f051ee7-ac5b-47fa-9d77-da04f99e6caf	5	Pipa Discharge	TOYO	1	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
5894ffcc-cdff-499e-beec-ce78c76bd9d7	5	Valve Limitter	TOYO	2	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
f0b41bf5-3987-43ce-8d6e-71a1432ca794	5	Flexible Hose	TOYO	3	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
75d3ac92-8654-4a76-b98e-61373321a973	5	Pipa After Flexible Hose	TOYO	4	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
171fff6c-24db-44db-8196-ad91ac0744d6	5	Hopper	TOYO	5	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
958d1903-e464-4333-b87d-4c56cb579e6a	5	Rotary Feeder	TOYO	6	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
59daab65-357e-4d6b-85a0-607d044f0be5	5	Subhopper	TOYO	7	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
a8f12b1d-b398-4320-8efa-b1accd406814	5	Filling Shutte	TOYO	8	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
04c96b34-b0aa-4c9d-8b96-e429815a3490	6	Pipa Discharge	TOYO	1	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
189b090d-3976-4a47-9c10-10508ceb6fe5	6	Valve Limitter	TOYO	2	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
92d8c167-c6a9-4231-9d25-153ab32060dc	6	Flexible Hose	TOYO	3	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
0ddc03f5-659b-430f-9595-010833ff6b9a	6	Pipa After Flexible Hose	TOYO	4	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
1990b03a-feab-4314-8c6a-c2c42f6a91b3	6	Hopper	TOYO	5	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
e6a8a369-8f0b-4338-8417-8005744d10be	6	Rotary Feeder	TOYO	6	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
32770007-3252-4ee3-8812-f344b0c8e55d	6	Subhopper	TOYO	7	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
f6bdbde3-3536-4ee7-bfe7-fa7959bfdfb3	6	Filling Shutte	TOYO	8	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
f37f94bd-369d-4f59-bbfa-2e744d632b44	7	Pipa Discharge	TOYO	1	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
fc65e1ba-5a81-43d0-a458-c0287544d87e	7	Valve Limitter	TOYO	2	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
5f5cf133-0070-447d-b14d-9950e68f814a	7	Flexible Hose	TOYO	3	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
493f23a6-f022-4989-a89b-79470a310c1c	7	Pipa After Flexible Hose	TOYO	4	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
77655a21-ecbc-4e75-a3f9-1b4d2c1bc219	7	Hopper	TOYO	5	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
2b80668b-c5a3-443f-b3a6-b305ab0c509b	7	Rotary Feeder	TOYO	6	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
def0d351-4c36-4c17-ac22-c021f244e711	7	Subhopper	TOYO	7	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
f08b3fec-2e4a-4ce0-a0ed-e34d26397f76	7	Filling Shutte	TOYO	8	t	\N	2026-04-09 07:10:02.555412+00	2026-04-09 07:10:02.555412+00
\.


--
-- Data for Name: checklist_stages; Type: TABLE DATA; Schema: public; Owner: elisa_user
--

COPY public.checklist_stages (id, stage_name, urutan, is_active) FROM stdin;
1	Pembongkaran	1	t
2	Pencucian	2	t
3	Pengeringan	3	t
4	Pembersihan bagian lain	4	t
5	Swab Test	5	t
6	Pemasangan	6	t
7	Pengencangan baut/klem	7	t
\.


--
-- Data for Name: cleaning_records; Type: TABLE DATA; Schema: public; Owner: elisa_user
--

COPY public.cleaning_records (id, machine_id, area_id, operator_id, cleaning_date, cleaning_type, produk_sebelumnya, produk_sesudahnya, waktu_mulai, waktu_selesai, durasi_menit, status, catatan, telegram_sent, telegram_sent_at, submitted_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cleaning_schedule; Type: TABLE DATA; Schema: public; Owner: elisa_user
--

COPY public.cleaning_schedule (id, machine_id, last_cleaned, next_cleaning, last_record_id, updated_at) FROM stdin;
8444c976-2fe6-4898-9564-3b9385297ad3	3edaf8b7-5786-4de7-82f7-60ddc0364e5b	\N	\N	\N	2026-04-09 07:10:06.442877+00
fd531fe9-4fec-47d8-b7cc-827828ca8a47	427e14f8-0dba-45d3-9ebc-639406f5b744	\N	\N	\N	2026-04-09 07:10:06.442877+00
24525178-8c20-46c4-af11-849a8eb514c8	fb566c11-6638-4687-9d54-bc527556e81e	\N	\N	\N	2026-04-09 07:10:06.442877+00
337a315c-c72f-496d-ae62-6641af1ac096	5502763d-2bf0-45ef-b77c-fa17b3dffba2	\N	\N	\N	2026-04-09 07:10:06.442877+00
d421194a-f256-4e78-935f-99cb9fce1693	505fbf4f-d699-4deb-a7cf-48bc4733467d	\N	\N	\N	2026-04-09 07:10:06.442877+00
2a7bc93a-f945-48b6-b0ca-fa1ccd115a6e	b35ded29-7448-4c67-844e-5483784caa8e	\N	\N	\N	2026-04-09 07:10:06.442877+00
20ccdda1-922c-4260-be99-4bdf5e099942	14136ff8-bb4d-4eee-a969-18951d9395b3	\N	\N	\N	2026-04-09 07:10:06.442877+00
7adf2ab1-125a-47b6-913e-50e6939dcd7d	36377398-5120-45eb-838e-cb3a861b02a5	\N	\N	\N	2026-04-09 07:10:06.442877+00
752466b8-0fa3-4114-bd81-b3278893d984	63f97416-0196-463c-b071-766a8474c2f7	\N	\N	\N	2026-04-09 07:10:06.442877+00
1817bd86-2558-4719-a14c-6067e36cbb2d	b7a9d5ee-db8d-401b-88f3-f591d6e46035	\N	\N	\N	2026-04-09 07:10:06.442877+00
5c9df3d1-5113-4d33-aadb-1cd09a388e45	0c1bd39d-eaa4-4b33-81f9-7eec05970438	\N	\N	\N	2026-04-09 07:10:06.442877+00
b64e93bb-5e09-4fd8-85fa-40bcbb477175	623e592e-31d8-492d-b80e-72a578644fdf	\N	\N	\N	2026-04-09 07:10:06.442877+00
2f9bb6b7-0577-429d-9191-45c255131e0e	05d1b7c5-6129-46cf-871e-0aed7e705d1b	\N	\N	\N	2026-04-09 07:10:06.442877+00
e20b5dee-f6b8-42aa-9ab7-33008eb0add8	8800b85b-47dc-409b-a5af-54a78de35411	\N	\N	\N	2026-04-09 07:10:06.442877+00
ac3c74d0-3de6-4f2d-a8fd-0b79173edff8	85c584d9-4356-455c-a42b-5f372033ead1	\N	\N	\N	2026-04-09 07:10:06.442877+00
2edfae68-d59a-4e36-8b82-91d224977bbd	0b4aa215-020e-45ab-b73c-84f1b8bc4493	\N	\N	\N	2026-04-09 07:10:06.442877+00
a7466af5-6516-4cb2-8a80-a71862c00e2e	5f15952f-1233-4963-867c-48aedbf1e063	\N	\N	\N	2026-04-09 07:10:06.442877+00
e9580bbb-62e1-45ad-8700-9f13fc7cfee3	bc005cfa-fe3e-43b4-952f-000906610b8e	\N	\N	\N	2026-04-09 07:10:06.442877+00
625b4e53-a8e7-4ce6-b194-e36edbe095d2	c4e323c7-6d3b-4199-9ab6-668af95e5749	\N	\N	\N	2026-04-09 07:10:06.442877+00
685e697b-f9df-450b-87ff-619739fb103e	2cbc2644-d929-4467-8429-7e7ae72f603d	\N	\N	\N	2026-04-09 07:10:06.442877+00
825572df-8c5c-42f6-b90e-ca60ba508243	5c0e5045-eda7-4acf-9ff8-2caab47a84de	\N	\N	\N	2026-04-09 07:10:06.442877+00
757969d1-40aa-4866-9b0b-399086540cc4	d2f7fa9a-cdf9-4e08-b529-70ce1ec5fe59	\N	\N	\N	2026-04-09 07:10:06.442877+00
0c9c3911-994a-4706-b2fe-f2019f90a616	df60986f-8324-4cea-99ae-96452df6c8e9	\N	\N	\N	2026-04-09 07:10:06.442877+00
ac9f01c1-6391-4e38-8883-97564f396378	d3b4347d-1771-41a1-ab76-4dac1f5090b2	\N	\N	\N	2026-04-09 07:10:06.442877+00
56a6e62d-c281-4324-ba45-0083c301a2fd	e73a1ad0-18f7-4239-b071-697b2a400ad5	\N	\N	\N	2026-04-09 07:10:06.442877+00
7765c526-1983-48c5-bf78-5233b47b7b22	a50616ec-1713-43f4-9b3e-406f7561cb46	\N	\N	\N	2026-04-09 07:10:06.442877+00
493dfae3-1966-445a-aaa9-8270ffe4b223	450cc39f-65f4-404f-9301-472a1bac78fa	\N	\N	\N	2026-04-09 07:10:06.442877+00
e244fd8d-7e51-40b9-bf5b-11d6b7119dd1	0486b857-75e7-42b5-ae5e-f1fa528bb15d	\N	\N	\N	2026-04-09 07:10:06.442877+00
2e4f4b6a-bb82-4967-8092-0617f2376ed0	85189d7e-532d-4d93-a7e9-c2da30b43e0c	\N	\N	\N	2026-04-09 07:10:06.442877+00
99aaa6c5-08a9-4dff-9708-0cfeb1043433	69a890cd-a22a-41da-a8c8-a4d46beb2bd8	\N	\N	\N	2026-04-09 07:10:06.442877+00
766ddd21-bc6d-4fd3-8f8a-73ffb6cddce2	f4079a97-393f-4d32-baca-91f36aa4c6f5	\N	\N	\N	2026-04-09 07:10:06.442877+00
6a5b1c3b-3ee6-4909-8780-e7e0346f654b	c808bc10-e776-489f-b24b-00ab644c92d6	\N	\N	\N	2026-04-09 07:10:06.442877+00
493bb0b3-92ad-4d03-a234-10274755cadd	1f5e5b59-ee63-4dad-9e90-f0f433a8f20f	\N	\N	\N	2026-04-09 07:10:06.442877+00
66a4e439-10bf-42ba-b592-81a48cce041b	66272bbb-bcd2-433d-9f09-5799a070400f	\N	\N	\N	2026-04-09 07:10:06.442877+00
82cad7f7-913c-4e3d-a673-a3b22d3e67b7	e01e8431-7bdd-4329-8d4a-e660a5031f97	\N	\N	\N	2026-04-09 07:10:06.442877+00
9d8255b6-23d9-4a53-aa53-9b2a0811546c	e9269af7-6ce4-49db-9d07-8db20afcb434	\N	\N	\N	2026-04-09 07:10:06.442877+00
baad3950-ae27-4e35-8f68-0b3098e7e438	c7313ef8-1045-4039-b490-12847a2e723d	\N	\N	\N	2026-04-09 07:10:06.442877+00
833b7e79-7b9b-43ee-aa04-4f80e8ca4b60	7c01bc01-f3ef-4357-98b9-6df91c9b65e0	\N	\N	\N	2026-04-09 07:10:06.442877+00
8afccb86-6122-4203-8938-0578bc53fe98	ef734f9c-75af-4c0e-a5b2-96f1d40c2c14	\N	\N	\N	2026-04-09 07:10:06.442877+00
b1d87f9a-2307-4230-a818-22a731726258	bd182e4d-8458-42f9-8d31-20aec24d3046	\N	\N	\N	2026-04-09 07:10:06.442877+00
55d135fc-6756-41dc-88ff-7caa4e3e53c0	a7b0acfc-a0a1-4521-a98c-60937d39d165	\N	\N	\N	2026-04-09 07:10:06.442877+00
dbce2440-0b4c-4bb7-8941-61bd31855579	0d65e27e-e8d0-4b3e-a4e3-d5d3eb94d098	\N	\N	\N	2026-04-09 07:10:06.442877+00
2de44ca6-1eb9-4b8d-bf96-48a4526830f7	fe994322-204c-459e-b6e0-c97696c4e82f	\N	\N	\N	2026-04-09 07:10:06.442877+00
8a8580cc-d665-4b55-aa5c-870a3ea1dcbb	031a067b-26a3-44d5-9482-c7626eca5a6b	\N	\N	\N	2026-04-09 07:10:06.442877+00
02323b5f-9395-4b82-bdcf-96b446e4f34e	5f4f391a-ef90-4a16-bef0-5cff25f1df9e	\N	\N	\N	2026-04-09 07:10:06.442877+00
8406abb5-c3f4-41b6-926f-6e4a76afc603	eda005f8-53a2-4ef7-b7c0-80e61f9dc3e7	\N	\N	\N	2026-04-09 07:10:06.442877+00
bae36cbc-59f1-4047-9072-c66dcfef6cb9	afddef08-2065-474f-b4dd-f7c5b299fe44	\N	\N	\N	2026-04-09 07:10:06.442877+00
93988d2e-1c73-4541-bade-c3250e6b8371	e2d35e09-91ab-4a7c-b975-8d65a55f798d	2026-04-03	2026-04-10	\N	2026-04-10 05:47:52.778817+00
d3c95bd2-3230-4a14-a2c4-1236a1424d56	63121585-768f-47b7-9c93-cf801820e4b6	2026-04-03	2026-04-10	\N	2026-04-10 05:47:52.821079+00
a809c40c-40be-469f-8436-ded65cac3f65	d0be6d53-9c52-464c-bcfe-47066689c8e1	2026-03-25	2026-04-01	\N	2026-04-10 05:47:52.824474+00
c1975525-94aa-4c21-88fc-580ef957580c	aa57acfe-fb7a-46da-b635-699347acf736	2026-04-03	2026-04-10	\N	2026-04-10 05:47:52.82819+00
f5aefcc7-7dcf-48af-b049-e455f8ac10a1	9188675a-0eee-42ed-b56e-1ce9197d886c	2026-04-03	2026-04-10	\N	2026-04-10 05:47:52.831428+00
208fa4d1-2df3-4092-80f6-fd2c777ec060	4a17fc71-2b5c-4e68-8630-6a78ee5b8c01	2026-04-03	2026-04-10	\N	2026-04-10 05:47:52.8369+00
8c2af622-f574-4d88-8fee-e17ea24dfb06	d289614b-40f0-4163-89d9-0f8194eb6992	2026-02-20	2026-02-27	\N	2026-04-10 05:47:52.840346+00
63d0ee5b-b2a2-45d4-ac93-8f1adc640f94	d434b230-e013-498a-995c-262e7253f5f9	2026-04-03	2026-04-10	\N	2026-04-10 05:47:52.843633+00
acd951e9-6166-41b4-bf37-1d4c3a0fbb83	9b376780-8c07-4062-bd43-fae24d14ba37	2026-01-15	2026-01-22	\N	2026-04-10 05:47:52.846786+00
a9eb25aa-fc37-4267-821a-f0032498a30f	9ad0448c-268d-47ef-96ef-644b195b344a	2026-02-15	2026-02-22	\N	2026-04-10 05:47:52.850254+00
\.


--
-- Data for Name: floor_config; Type: TABLE DATA; Schema: public; Owner: elisa_user
--

COPY public.floor_config (id, area_id, rule_type, window_start_days, window_end_days, overdue_after_days, due_soon_from_day, updated_by, updated_at) FROM stdin;
1	1	rolling	30	35	35	30	\N	2026-04-09 07:10:01.569685+00
2	2	hard_deadline	5	7	7	5	\N	2026-04-09 07:10:01.587723+00
3	3	hard_deadline	5	7	7	5	\N	2026-04-09 07:10:01.602216+00
4	4	hard_deadline	5	7	7	5	\N	2026-04-09 07:10:01.612907+00
\.


--
-- Data for Name: lines; Type: TABLE DATA; Schema: public; Owner: elisa_user
--

COPY public.lines (id, area_id, line_name, created_at) FROM stdin;
1	1	Line A	2026-04-09 07:10:01.826214+00
2	1	Line B	2026-04-09 07:10:01.826214+00
3	1	Line C	2026-04-09 07:10:01.826214+00
4	1	Line D	2026-04-09 07:10:01.826214+00
5	1	Line E	2026-04-09 07:10:01.826214+00
6	1	Line F	2026-04-09 07:10:01.826214+00
7	1	Line G	2026-04-09 07:10:01.826214+00
8	1	Line H	2026-04-09 07:10:01.826214+00
9	1	Line J	2026-04-09 07:10:01.826214+00
10	1	Line K	2026-04-09 07:10:01.826214+00
11	1	Line L	2026-04-09 07:10:01.826214+00
12	1	Line M	2026-04-09 07:10:01.826214+00
13	1	Line N	2026-04-09 07:10:01.826214+00
14	1	Line S	2026-04-09 07:10:01.826214+00
15	1	Line T	2026-04-09 07:10:01.826214+00
16	1	Line P	2026-04-09 07:10:01.826214+00
\.


--
-- Data for Name: machine_parts; Type: TABLE DATA; Schema: public; Owner: elisa_user
--

COPY public.machine_parts (id, machine_id, part_code, part_name, urutan, is_active, created_at) FROM stdin;
6924d76e-bd7a-41e2-9e11-edba0bbe2dd9	63121585-768f-47b7-9c93-cf801820e4b6	K1T1P01	K1T1P01	1	t	2026-04-09 07:10:06.101303+00
64f21a8c-556c-4c2a-a411-57bfe2a7bff0	d0be6d53-9c52-464c-bcfe-47066689c8e1	K1T2P01	K1T2P01	1	t	2026-04-09 07:10:06.101303+00
2f34564a-5bb6-47f4-84bc-3ababd76250f	aa57acfe-fb7a-46da-b635-699347acf736	K1T3P01	K1T3P01	1	t	2026-04-09 07:10:06.101303+00
15370053-fd24-4b7c-87f5-70b62d72dc8c	9188675a-0eee-42ed-b56e-1ce9197d886c	K1T4P01	K1T4P01	1	t	2026-04-09 07:10:06.101303+00
eda399b2-a7b7-40de-8b39-f43de76d4c3a	4a17fc71-2b5c-4e68-8630-6a78ee5b8c01	K1T5P01	K1T5P01	1	t	2026-04-09 07:10:06.101303+00
6ef1f85e-555c-46a8-8528-c5f6a61ef927	d289614b-40f0-4163-89d9-0f8194eb6992	K1T6P01	K1T6P01	1	t	2026-04-09 07:10:06.101303+00
c73ccb99-a6d3-466a-b698-2ee522781423	d434b230-e013-498a-995c-262e7253f5f9	K1T7P01	K1T7P01	1	t	2026-04-09 07:10:06.101303+00
49cd2d12-9cf2-4774-97d1-8c2aa9d58307	9b376780-8c07-4062-bd43-fae24d14ba37	K1T8P01	K1T8P01	1	t	2026-04-09 07:10:06.101303+00
0cd27a9a-5502-4ff1-b040-1125fe4e3de3	9ad0448c-268d-47ef-96ef-644b195b344a	K1T9P01	K1T9P01	1	t	2026-04-09 07:10:06.101303+00
c713aaaf-ca91-4d30-93f3-b7193a8b5502	c4e323c7-6d3b-4199-9ab6-668af95e5749	K1G1P01	K1G1P01	1	t	2026-04-09 07:10:06.21387+00
c2a7b0c4-fb50-4935-8c7d-5adc44b6f4b8	2cbc2644-d929-4467-8429-7e7ae72f603d	K1G2P01	K1G2P01	1	t	2026-04-09 07:10:06.21387+00
fc498ec5-5a6b-46c5-8406-f7d208aa992f	5c0e5045-eda7-4acf-9ff8-2caab47a84de	K1G3P01	K1G3P01	1	t	2026-04-09 07:10:06.21387+00
21314b8a-16ec-4406-9be6-9422cdd38474	d2f7fa9a-cdf9-4e08-b529-70ce1ec5fe59	K1G4P01	K1G4P01	1	t	2026-04-09 07:10:06.21387+00
e93ef980-2476-404d-921b-da45f9b51576	df60986f-8324-4cea-99ae-96452df6c8e9	K1G5P01	K1G5P01	1	t	2026-04-09 07:10:06.21387+00
e6e11f98-1377-4c5f-b2b0-a0963da3aaa7	d3b4347d-1771-41a1-ab76-4dac1f5090b2	K1G6P01	K1G6P01	1	t	2026-04-09 07:10:06.21387+00
0bf255bb-e3ee-4669-8f83-11947f1978d0	e73a1ad0-18f7-4239-b071-697b2a400ad5	K1G7P01	K1G7P01	1	t	2026-04-09 07:10:06.21387+00
b0dddc6d-2285-48b7-83b3-affa62e86843	a50616ec-1713-43f4-9b3e-406f7561cb46	K1G8P01	K1G8P01	1	t	2026-04-09 07:10:06.21387+00
0bb27d7a-c851-4084-b5a2-93f5e676eb5b	450cc39f-65f4-404f-9301-472a1bac78fa	K1G9P01	K1G9P01	1	t	2026-04-09 07:10:06.21387+00
2f5b27c4-32a2-433a-92b1-bfc327bfa66d	0486b857-75e7-42b5-ae5e-f1fa528bb15d	K1G10P01	K1G10P01	1	t	2026-04-09 07:10:06.21387+00
a8b89d0d-b902-467d-8060-80bd8ba41bad	85189d7e-532d-4d93-a7e9-c2da30b43e0c	K1G11P01	K1G11P01	1	t	2026-04-09 07:10:06.21387+00
090a7655-d6f2-4d48-8183-1c28d768e0de	69a890cd-a22a-41da-a8c8-a4d46beb2bd8	K1G12P01	K1G12P01	1	t	2026-04-09 07:10:06.21387+00
75e3e860-2c52-49ff-a5ea-9dd357a29f3c	f4079a97-393f-4d32-baca-91f36aa4c6f5	K1G13P01	K1G13P01	1	t	2026-04-09 07:10:06.21387+00
4f3b3494-7906-485d-9d53-85408a6b97bd	c808bc10-e776-489f-b24b-00ab644c92d6	K1G14P01	K1G14P01	1	t	2026-04-09 07:10:06.21387+00
43796bc6-1716-437e-9e47-f4021a218f67	1f5e5b59-ee63-4dad-9e90-f0f433a8f20f	K1G15P01	K1G15P01	1	t	2026-04-09 07:10:06.21387+00
8ed24488-0d77-4bc7-af1b-4d9c9443f2ad	66272bbb-bcd2-433d-9f09-5799a070400f	K1G16P01	K1G16P01	1	t	2026-04-09 07:10:06.21387+00
38966be8-c7c7-4eb7-9c71-b6ca6c15fcdb	e01e8431-7bdd-4329-8d4a-e660a5031f97	K1G17P01	K1G17P01	1	t	2026-04-09 07:10:06.21387+00
689d9902-b595-4da5-aae5-d4b02e8c67d6	e9269af7-6ce4-49db-9d07-8db20afcb434	K1G18P01	K1G18P01	1	t	2026-04-09 07:10:06.21387+00
e6442bba-160a-42bb-949d-7d86c21b5fc0	c7313ef8-1045-4039-b490-12847a2e723d	K1G19P01	K1G19P01	1	t	2026-04-09 07:10:06.21387+00
99cfd6d2-fe88-4d3d-b573-a77adc7934db	7c01bc01-f3ef-4357-98b9-6df91c9b65e0	K1G20P01	K1G20P01	1	t	2026-04-09 07:10:06.21387+00
d471d8aa-c693-4639-aeb5-33d0c6f2e788	ef734f9c-75af-4c0e-a5b2-96f1d40c2c14	K1G21P01	K1G21P01	1	t	2026-04-09 07:10:06.21387+00
ffd5f554-67c3-4d47-90a6-249138b4292e	bd182e4d-8458-42f9-8d31-20aec24d3046	K1G22P01	K1G22P01	1	t	2026-04-09 07:10:06.21387+00
f90ce040-68d7-46e1-8d5d-4ee677cf22f3	a7b0acfc-a0a1-4521-a98c-60937d39d165	K1G23P01	K1G23P01	1	t	2026-04-09 07:10:06.21387+00
f848fa12-b16f-4150-a0c7-01f3c67fbb25	0d65e27e-e8d0-4b3e-a4e3-d5d3eb94d098	K1G24P01	K1G24P01	1	t	2026-04-09 07:10:06.21387+00
5464aa1c-e8f9-4483-9361-fdbead2d63b9	fe994322-204c-459e-b6e0-c97696c4e82f	K1G25P01	K1G25P01	1	t	2026-04-09 07:10:06.21387+00
51756fe8-fe5c-4919-9cac-39268d3d33b8	e2d35e09-91ab-4a7c-b975-8d65a55f798d	K1R1P01DP001	Tipping Station Minor 1	1	t	2026-04-09 07:10:06.284021+00
9e1e7921-d344-49e0-a563-cc99e4f5649f	e2d35e09-91ab-4a7c-b975-8d65a55f798d	K1R2P01DP001	Tipping Station Minor 2	2	t	2026-04-09 07:10:06.284021+00
2561ab09-7244-477c-9d49-d78ce42f8917	e2d35e09-91ab-4a7c-b975-8d65a55f798d	K1R2P01DP002	Tipping Station Honeydew	3	t	2026-04-09 07:10:06.284021+00
0917a95d-18d6-4567-a381-c708233a31fe	e2d35e09-91ab-4a7c-b975-8d65a55f798d	K1R3P01DP001	Dumping Station Sodium Bicarbonate	4	t	2026-04-09 07:10:06.284021+00
d54f2d42-2f2c-4501-b16d-fd8dc9bbb13b	e2d35e09-91ab-4a7c-b975-8d65a55f798d	K1R4P01DP001	Tipping Station Minor 3 (Active)	5	t	2026-04-09 07:10:06.284021+00
d49c1db3-73d4-4059-a7dd-a67d167afc2a	e2d35e09-91ab-4a7c-b975-8d65a55f798d	K1R6P01DP001	Dumping Station Taurine	6	t	2026-04-09 07:10:06.284021+00
af9235c1-30b9-40e1-8741-b1668f80836c	e2d35e09-91ab-4a7c-b975-8d65a55f798d	K1R7P01DP001	Dumping Station Citric Acid	7	t	2026-04-09 07:10:06.284021+00
ba76bd02-46b3-4ef2-9c69-4583b8b3cdfe	e2d35e09-91ab-4a7c-b975-8d65a55f798d	K1R8P01DP002	Tipping Station Sucrose	8	t	2026-04-09 07:10:06.284021+00
feeaa4e3-48ae-4039-b91b-ad33ac47765a	afddef08-2065-474f-b4dd-f7c5b299fe44	CENTONG-1	Centong 1	1	t	2026-04-09 07:10:06.383392+00
c8cfc632-e7ef-47c1-8e7b-0dd9b0d22a86	afddef08-2065-474f-b4dd-f7c5b299fe44	CENTONG-2	Centong 2	2	t	2026-04-09 07:10:06.383392+00
b11a6539-24a2-492b-bc7f-0599c55a223f	afddef08-2065-474f-b4dd-f7c5b299fe44	CENTONG-3	Centong 3	3	t	2026-04-09 07:10:06.383392+00
d361ecad-c5c9-4b44-b400-25d345ec975f	afddef08-2065-474f-b4dd-f7c5b299fe44	CENTONG-4	Centong 4	4	t	2026-04-09 07:10:06.383392+00
0d8d0921-3cb4-4958-bfc1-996ebcf352d0	afddef08-2065-474f-b4dd-f7c5b299fe44	CENTONG-5	Centong 5	5	t	2026-04-09 07:10:06.383392+00
dc8a4b9e-f02a-48b8-8fe5-d469553e85d1	afddef08-2065-474f-b4dd-f7c5b299fe44	CENTONG-6	Centong 6	6	t	2026-04-09 07:10:06.383392+00
62e7e8a4-cafe-423e-8a45-f99eeb9a8756	afddef08-2065-474f-b4dd-f7c5b299fe44	CENTONG-7	Centong 7	7	t	2026-04-09 07:10:06.383392+00
23208b29-916e-4625-803f-2f9e0ea11a64	afddef08-2065-474f-b4dd-f7c5b299fe44	CENTONG-8	Centong 8	8	t	2026-04-09 07:10:06.383392+00
dae946c8-8bf4-425f-96ea-c8ef1f0e8de0	afddef08-2065-474f-b4dd-f7c5b299fe44	CENTONG-9	Centong 9	9	t	2026-04-09 07:10:06.383392+00
04b2ca82-3fe2-4202-a816-4eb94c49eae9	afddef08-2065-474f-b4dd-f7c5b299fe44	CENTONG-10	Centong 10	10	t	2026-04-09 07:10:06.383392+00
416fa481-8075-4c01-876b-0cb7c3783297	afddef08-2065-474f-b4dd-f7c5b299fe44	CENTONG-11	Centong 11	11	t	2026-04-09 07:10:06.383392+00
ecf5a639-17bd-437d-ba11-936f771f7045	afddef08-2065-474f-b4dd-f7c5b299fe44	CENTONG-12	Centong 12	12	t	2026-04-09 07:10:06.383392+00
7f2f52b2-8921-4658-91cd-d2bf5ad03f93	afddef08-2065-474f-b4dd-f7c5b299fe44	CENTONG-13	Centong 13	13	t	2026-04-09 07:10:06.383392+00
c3ad4638-b2fe-4a5e-8527-7226ba621da9	afddef08-2065-474f-b4dd-f7c5b299fe44	CENTONG-14	Centong 14	14	t	2026-04-09 07:10:06.383392+00
c01cecdc-97cd-48c9-883b-18d8d0aacdac	afddef08-2065-474f-b4dd-f7c5b299fe44	CENTONG-15	Centong 15	15	t	2026-04-09 07:10:06.383392+00
\.


--
-- Data for Name: machines; Type: TABLE DATA; Schema: public; Owner: elisa_user
--

COPY public.machines (id, area_id, line_id, machine_code, machine_name, machine_type, sub_label, is_active, created_by, created_at, updated_at) FROM stdin;
3edaf8b7-5786-4de7-82f7-60ddc0364e5b	1	1	RVS-A	RVS A	RVS	Mesin Filling Sachet RVS 6 line (A)	t	\N	2026-04-09 07:10:05.997794+00	2026-04-09 07:10:05.997794+00
427e14f8-0dba-45d3-9ebc-639406f5b744	1	2	RVS-B	RVS B	RVS	Mesin Filling Sachet RVS 6 line (B)	t	\N	2026-04-09 07:10:05.997794+00	2026-04-09 07:10:05.997794+00
fb566c11-6638-4687-9d54-bc527556e81e	1	3	TOYO-C	TOYO C	TOYO	Mesin Filling Sachet TOYO 10 line (C)	t	\N	2026-04-09 07:10:05.997794+00	2026-04-09 07:10:05.997794+00
5502763d-2bf0-45ef-b77c-fa17b3dffba2	1	4	RVS-D	RVS D	RVS	Mesin Filling Sachet RVS 6 line (D)	t	\N	2026-04-09 07:10:05.997794+00	2026-04-09 07:10:05.997794+00
505fbf4f-d699-4deb-a7cf-48bc4733467d	1	5	RVS-E	RVS E	RVS	Mesin Filling Sachet RVS 6 line (E)	t	\N	2026-04-09 07:10:05.997794+00	2026-04-09 07:10:05.997794+00
b35ded29-7448-4c67-844e-5483784caa8e	1	6	RVS-F	RVS F	RVS	Mesin Filling Sachet RVS 6 line (F)	t	\N	2026-04-09 07:10:05.997794+00	2026-04-09 07:10:05.997794+00
14136ff8-bb4d-4eee-a969-18951d9395b3	1	7	RVS-G	RVS G	RVS	Mesin Filling Sachet RVS 6 line (G)	t	\N	2026-04-09 07:10:05.997794+00	2026-04-09 07:10:05.997794+00
36377398-5120-45eb-838e-cb3a861b02a5	1	8	RVS-H	RVS H	RVS	Mesin Filling Sachet RVS 6 line (H)	t	\N	2026-04-09 07:10:05.997794+00	2026-04-09 07:10:05.997794+00
63f97416-0196-463c-b071-766a8474c2f7	1	9	RVS-J	RVS J	RVS	Mesin Filling Sachet RVS 6 line (J)	t	\N	2026-04-09 07:10:05.997794+00	2026-04-09 07:10:05.997794+00
b7a9d5ee-db8d-401b-88f3-f591d6e46035	1	10	RVS-K	RVS K	RVS	Mesin Filling Sachet RVS 6 line (K)	t	\N	2026-04-09 07:10:05.997794+00	2026-04-09 07:10:05.997794+00
0c1bd39d-eaa4-4b33-81f9-7eec05970438	1	11	RVS-L	RVS L	RVS	Mesin Filling Sachet RVS 6 line (L)	t	\N	2026-04-09 07:10:05.997794+00	2026-04-09 07:10:05.997794+00
623e592e-31d8-492d-b80e-72a578644fdf	1	12	RVS-M	RVS M	RVS	Mesin Filling Sachet RVS 6 line (M)	t	\N	2026-04-09 07:10:05.997794+00	2026-04-09 07:10:05.997794+00
05d1b7c5-6129-46cf-871e-0aed7e705d1b	1	13	RVS-N	RVS N	RVS	Mesin Filling Sachet RVS 6 line (N)	t	\N	2026-04-09 07:10:05.997794+00	2026-04-09 07:10:05.997794+00
8800b85b-47dc-409b-a5af-54a78de35411	1	14	RVS-S	RVS S	RVS	Mesin Filling Sachet RVS 6 line (S)	t	\N	2026-04-09 07:10:05.997794+00	2026-04-09 07:10:05.997794+00
85c584d9-4356-455c-a42b-5f372033ead1	1	15	RVS-T	RVS T	RVS	Mesin Filling Sachet RVS 6 line (T)	t	\N	2026-04-09 07:10:05.997794+00	2026-04-09 07:10:05.997794+00
0b4aa215-020e-45ab-b73c-84f1b8bc4493	1	16	RVS-P	RVS P	RVS	Mesin Filling Sachet RVS 6 line (P)	t	\N	2026-04-09 07:10:05.997794+00	2026-04-09 07:10:05.997794+00
5f15952f-1233-4963-867c-48aedbf1e063	1	\N	MF-1	MF 1	MF	Mesin Filling Stickpack (V)	t	\N	2026-04-09 07:10:06.080546+00	2026-04-09 07:10:06.080546+00
bc005cfa-fe3e-43b4-952f-000906610b8e	1	\N	MF-2	MF 2	MF	Mesin Filling Stickpack (W)	t	\N	2026-04-09 07:10:06.080546+00	2026-04-09 07:10:06.080546+00
63121585-768f-47b7-9c93-cf801820e4b6	2	\N	K1T1	Batching Station Sodium Bicarbonate 1	TS	Compounding - Lantai 2	t	\N	2026-04-09 07:10:06.096578+00	2026-04-09 07:10:06.096578+00
d0be6d53-9c52-464c-bcfe-47066689c8e1	2	\N	K1T2	Batching Station Sodium Bicarbonate 2	TS	Compounding - Lantai 2	t	\N	2026-04-09 07:10:06.096578+00	2026-04-09 07:10:06.096578+00
aa57acfe-fb7a-46da-b635-699347acf736	2	\N	K1T3	Batching Station Minor 1	TS	Compounding - Lantai 2	t	\N	2026-04-09 07:10:06.096578+00	2026-04-09 07:10:06.096578+00
9188675a-0eee-42ed-b56e-1ce9197d886c	2	\N	K1T4	Batching Station Minor Active	TS	Compounding - Lantai 2	t	\N	2026-04-09 07:10:06.096578+00	2026-04-09 07:10:06.096578+00
4a17fc71-2b5c-4e68-8630-6a78ee5b8c01	2	\N	K1T5	Batching Station Minor 2	TS	Compounding - Lantai 2	t	\N	2026-04-09 07:10:06.096578+00	2026-04-09 07:10:06.096578+00
d289614b-40f0-4163-89d9-0f8194eb6992	2	\N	K1T6	Batching Station Minor 3	TS	Compounding - Lantai 2	t	\N	2026-04-09 07:10:06.096578+00	2026-04-09 07:10:06.096578+00
d434b230-e013-498a-995c-262e7253f5f9	2	\N	K1T7	Batching Station Citric	TS	Compounding - Lantai 2	t	\N	2026-04-09 07:10:06.096578+00	2026-04-09 07:10:06.096578+00
9b376780-8c07-4062-bd43-fae24d14ba37	2	\N	K1T8	Batching Station Sucrose	TS	Compounding - Lantai 2	t	\N	2026-04-09 07:10:06.096578+00	2026-04-09 07:10:06.096578+00
9ad0448c-268d-47ef-96ef-644b195b344a	2	\N	K1T9	Batching Station Material 4	TS	Compounding - Lantai 2	t	\N	2026-04-09 07:10:06.096578+00	2026-04-09 07:10:06.096578+00
c4e323c7-6d3b-4199-9ab6-668af95e5749	2	\N	K1G1	Discharge Station 1 (A)	DS	Compounding - Lantai 2	t	\N	2026-04-09 07:10:06.147718+00	2026-04-09 07:10:06.147718+00
2cbc2644-d929-4467-8429-7e7ae72f603d	2	\N	K1G2	Discharge Station 2 (B)	DS	Compounding - Lantai 2	t	\N	2026-04-09 07:10:06.147718+00	2026-04-09 07:10:06.147718+00
5c0e5045-eda7-4acf-9ff8-2caab47a84de	2	\N	K1G3	Discharge Station 3 (C)	DS	Compounding - Lantai 2	t	\N	2026-04-09 07:10:06.147718+00	2026-04-09 07:10:06.147718+00
d2f7fa9a-cdf9-4e08-b529-70ce1ec5fe59	2	\N	K1G4	Discharge Station 4 (D)	DS	Compounding - Lantai 2	t	\N	2026-04-09 07:10:06.147718+00	2026-04-09 07:10:06.147718+00
df60986f-8324-4cea-99ae-96452df6c8e9	2	\N	K1G5	Discharge Station 5 (E)	DS	Compounding - Lantai 2	t	\N	2026-04-09 07:10:06.147718+00	2026-04-09 07:10:06.147718+00
d3b4347d-1771-41a1-ab76-4dac1f5090b2	2	\N	K1G6	Discharge Station 6 (F)	DS	Compounding - Lantai 2	t	\N	2026-04-09 07:10:06.147718+00	2026-04-09 07:10:06.147718+00
e73a1ad0-18f7-4239-b071-697b2a400ad5	2	\N	K1G7	Discharge Station 7 (G)	DS	Compounding - Lantai 2	t	\N	2026-04-09 07:10:06.147718+00	2026-04-09 07:10:06.147718+00
a50616ec-1713-43f4-9b3e-406f7561cb46	2	\N	K1G8	Discharge Station 8 (H)	DS	Compounding - Lantai 2	t	\N	2026-04-09 07:10:06.147718+00	2026-04-09 07:10:06.147718+00
450cc39f-65f4-404f-9301-472a1bac78fa	2	\N	K1G9	Discharge Station 9 (J)	DS	Compounding - Lantai 2	t	\N	2026-04-09 07:10:06.147718+00	2026-04-09 07:10:06.147718+00
0486b857-75e7-42b5-ae5e-f1fa528bb15d	2	\N	K1G10	Discharge Station 10 (K)	DS	Compounding - Lantai 2	t	\N	2026-04-09 07:10:06.147718+00	2026-04-09 07:10:06.147718+00
85189d7e-532d-4d93-a7e9-c2da30b43e0c	2	\N	K1G11	Discharge Station 11 (L)	DS	Compounding - Lantai 2	t	\N	2026-04-09 07:10:06.147718+00	2026-04-09 07:10:06.147718+00
69a890cd-a22a-41da-a8c8-a4d46beb2bd8	2	\N	K1G12	Discharge Station 12 (M)	DS	Compounding - Lantai 2	t	\N	2026-04-09 07:10:06.147718+00	2026-04-09 07:10:06.147718+00
f4079a97-393f-4d32-baca-91f36aa4c6f5	2	\N	K1G13	Discharge Station 13 (N)	DS	Compounding - Lantai 2	t	\N	2026-04-09 07:10:06.147718+00	2026-04-09 07:10:06.147718+00
c808bc10-e776-489f-b24b-00ab644c92d6	2	\N	K1G14	Discharge Station 14 (S)	DS	Compounding - Lantai 2	t	\N	2026-04-09 07:10:06.147718+00	2026-04-09 07:10:06.147718+00
1f5e5b59-ee63-4dad-9e90-f0f433a8f20f	2	\N	K1G15	Discharge Station 15	DS	Compounding - Lantai 2	t	\N	2026-04-09 07:10:06.147718+00	2026-04-09 07:10:06.147718+00
66272bbb-bcd2-433d-9f09-5799a070400f	2	\N	K1G16	Discharge Station 16 (R)	DS	Compounding - Lantai 2	t	\N	2026-04-09 07:10:06.147718+00	2026-04-09 07:10:06.147718+00
e01e8431-7bdd-4329-8d4a-e660a5031f97	2	\N	K1G17	Discharge Station 17	DS	Compounding - Lantai 2	t	\N	2026-04-09 07:10:06.147718+00	2026-04-09 07:10:06.147718+00
e9269af7-6ce4-49db-9d07-8db20afcb434	2	\N	K1G18	Discharge Station 18 (MF2)	DS	Compounding - Lantai 2	t	\N	2026-04-09 07:10:06.147718+00	2026-04-09 07:10:06.147718+00
c7313ef8-1045-4039-b490-12847a2e723d	2	\N	K1G19	Discharge Station 19 (MF1)	DS	Compounding - Lantai 2	t	\N	2026-04-09 07:10:06.147718+00	2026-04-09 07:10:06.147718+00
7c01bc01-f3ef-4357-98b9-6df91c9b65e0	2	\N	K1G20	Discharge Station 20 (T)	DS	Compounding - Lantai 2	t	\N	2026-04-09 07:10:06.147718+00	2026-04-09 07:10:06.147718+00
ef734f9c-75af-4c0e-a5b2-96f1d40c2c14	2	\N	K1G21	Discharge Station 21	DS	Compounding - Lantai 2	t	\N	2026-04-09 07:10:06.147718+00	2026-04-09 07:10:06.147718+00
bd182e4d-8458-42f9-8d31-20aec24d3046	2	\N	K1G22	Discharge Station 22 (Flavor)	DS	Compounding - Lantai 2	t	\N	2026-04-09 07:10:06.147718+00	2026-04-09 07:10:06.147718+00
a7b0acfc-a0a1-4521-a98c-60937d39d165	2	\N	K1G23	Discharge Station 23 (P)	DS	Compounding - Lantai 2	t	\N	2026-04-09 07:10:06.147718+00	2026-04-09 07:10:06.147718+00
0d65e27e-e8d0-4b3e-a4e3-d5d3eb94d098	2	\N	K1G24	Discharge Station 24	DS	Compounding - Lantai 2	t	\N	2026-04-09 07:10:06.147718+00	2026-04-09 07:10:06.147718+00
fe994322-204c-459e-b6e0-c97696c4e82f	2	\N	K1G25	Discharge Station 25	DS	Compounding - Lantai 2	t	\N	2026-04-09 07:10:06.147718+00	2026-04-09 07:10:06.147718+00
e2d35e09-91ab-4a7c-b975-8d65a55f798d	3	\N	TS-K1R	Tipping & Dumping Station	K1R	Compounding - Lantai 3	t	\N	2026-04-09 07:10:06.275188+00	2026-04-09 07:10:06.275188+00
031a067b-26a3-44d5-9482-c7626eca5a6b	4	\N	WB-1	Weighing Booth 1	WB	Compounding - Lantai 4	t	\N	2026-04-09 07:10:06.311586+00	2026-04-09 07:10:06.311586+00
5f4f391a-ef90-4a16-bef0-5cff25f1df9e	4	\N	WB-2	Weighing Booth 2	WB	Compounding - Lantai 4	t	\N	2026-04-09 07:10:06.311586+00	2026-04-09 07:10:06.311586+00
eda005f8-53a2-4ef7-b7c0-80e61f9dc3e7	4	\N	WB-3	Weighing Booth 3	WB	Compounding - Lantai 4	t	\N	2026-04-09 07:10:06.311586+00	2026-04-09 07:10:06.311586+00
afddef08-2065-474f-b4dd-f7c5b299fe44	4	\N	PT-CENTONG	Peralatan Timbang	WB	Compounding - Lantai 4	t	\N	2026-04-09 07:10:06.311586+00	2026-04-09 07:10:06.311586+00
\.


--
-- Data for Name: qa_verifications; Type: TABLE DATA; Schema: public; Owner: elisa_user
--

COPY public.qa_verifications (id, record_id, qa_id, decision, remarks, corrective_action, report_url, is_draft, verified_at) FROM stdin;
\.


--
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: elisa_user
--

COPY public.reports (id, record_id, report_name, report_type, floor, start_date, end_date, report_url, is_draft, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: elisa_user
--

COPY public.roles (id, name, created_at) FROM stdin;
1	admin	2026-04-09 06:12:13.97126+00
2	operator	2026-04-09 06:12:13.97126+00
3	qa	2026-04-09 06:12:13.97126+00
4	site_head	2026-04-09 06:12:13.97126+00
5	supervisor	2026-04-10 03:21:04.818168+00
\.


--
-- Data for Name: room_readiness_lembar_review; Type: TABLE DATA; Schema: public; Owner: elisa_user
--

COPY public.room_readiness_lembar_review (id, site, area_id, param_suhu, param_rh, param_dp, periode, date_start, time_start, date_end, time_end, suhu_min, suhu_max, suhu_avg, suhu_syarat, rh_min, rh_max, rh_avg, rh_syarat, reviewed_by_1, reviewed_by_2, reviewed_by_3, review_date, notes, submitted_by, report_url, submitted_at) FROM stdin;
\.


--
-- Data for Name: room_readiness_reviews; Type: TABLE DATA; Schema: public; Owner: elisa_user
--

COPY public.room_readiness_reviews (id, suhu_rh_id, reviewed_by, action, notes, telegram_sent, reviewed_at) FROM stdin;
\.


--
-- Data for Name: suhu_rh; Type: TABLE DATA; Schema: public; Owner: elisa_user
--

COPY public.suhu_rh (id, machine_id, line_id, tagname, description, timestamp_start, timestamp_end, suhu, rh, status, synced_at) FROM stdin;
\.


--
-- Data for Name: telegram_notifications; Type: TABLE DATA; Schema: public; Owner: elisa_user
--

COPY public.telegram_notifications (id, record_id, review_id, notif_type, message_text, is_sent, chat_id, sent_at, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: elisa_user
--

COPY public.users (id, role_id, full_name, username, password_hash, area, is_active, last_login, created_at, updated_at) FROM stdin;
2a2371eb-41ee-4027-9c63-be5563fca0fd	2	Ade Masruri	ade_masruri	230701190	Compounding	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
b8db3b7e-7cb3-4760-95e8-2b0497c21bd9	2	Ade Yanto	ade_yanto	210400944	Filling	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
b23d05ec-b90d-4817-a077-72e7a1bac985	2	Adi Septri	adi_septri	200801688	Compounding	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
3e962c8f-d032-4cd7-816e-5955dd608a2c	2	Afriaji I	afriaji	221102119	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
b46b5650-dd14-4477-bd08-ec95ee1bdd29	2	Aldi Novianto	aldi_novianto	200300855	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
a4ac6b03-550d-49b4-b651-82604f6a7b90	2	Ali Ramdan	ali_ramdan	130800370	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
7b4850a1-fe74-4296-a7b7-80b7bf076010	2	Aloysius Excel	aloysius_excel	230701208	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
62152972-6a58-485e-a507-d7c985684829	2	Alvian Aji	alvian_aji	210400895	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
0b1559c7-e631-4aaa-b71e-7d49f32ff602	2	Amirudin	amirudin	221102118	Filling	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
4a44b967-ad2c-4108-8829-b0ccf87a6dab	2	Anah Muazizah	anah	230801446	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
01e85a1c-a94e-4cbe-8d77-8293a91b2420	2	Andi Pratama	andi_pratama	210200572	Filling	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
3203e642-5a14-4336-a7be-33c9dc2c7a04	2	Antonius Yudha	antonius_yudha	210300738	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
a6ab1bac-271b-4043-8c0a-ca3ceaab04ef	2	Ari Wibowo	ari_wibowo	071200066	Filling	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
1ce146e6-4493-458b-92b4-eff54da7dcda	2	Arief Retno	arief_retno	221001977	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
cfd44ec6-18a0-403a-a361-6f4db786b69b	2	Asene	asene	130800361	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
8e483cf9-22f5-4566-920f-38802663c893	2	Asep Rahmat	asep_rahmat	130800383	Compounding	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
b70db837-fddd-47ed-92e2-01f6b321e069	2	Ayyasy Ahmad	ayyasy_ahmad	221202414	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
3dc2f21d-d7f6-4daa-a3d7-d2b5110421ca	2	Azmi	azmi	130800386	Filling	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
2713e7a9-c265-4208-b7ca-27ac3a56613f	2	Bagas Pangestu	bagas_pangestu	210300735	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
61a9f7cd-e63e-435e-8fe0-488e0660c659	2	Bambang Hartoyo	bambang	130800366	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
d4b59c5e-7244-4c59-b8d6-044794824801	2	Bayu Setyawan	bayu	230701239	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
905a6144-7d08-4299-bc8c-331d0a3339a7	2	Candra Herdiawan	candra_herdiawan	210801776	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
75874403-33a7-4f12-8e27-5c4963a8cf12	2	Catur Setyo	catur_setyo	211002190	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
b60009bc-b453-410a-8a99-05fa0f3bbf00	2	Choerul Anam	choerul_anam	210200559	Filling	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
f4a61b9e-0113-45ea-872c-714a10a4935b	2	Cukup Slamet	cukup_slamet	120300256	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
e5b3bc1a-284d-4370-8dd2-91b03b6c0252	2	Dadi	dadi	210400914	Filling	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
e2ebe5e0-3fcf-4089-ac14-ab1ca7389c79	2	Dani Mulyadi	dani_mulyadi	211002218	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
3d7affee-4389-429c-83f2-016e059d6e29	2	Dede Apriyanto	dede_apriyanto	230701192	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
05a56aa9-c5ed-4994-89ad-61703a880ad0	2	Dendi Kusnadi	dendi_kusnadi	210400896	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
f861243a-37d7-495b-aee9-fe5374ba9038	2	Denni M.	denni	210300737	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
04f46a88-11f1-406e-916c-d16cfe1f6bf8	2	Diana Putri	diana_putri	210400904	Filling	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
bcb8dd57-644e-48e6-ac05-f41bab70ba4d	2	Dicky Kurniawan	dicky_kurniawan	211002193	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
88e5d59b-1c05-43e6-9b2b-d73106dcab2c	2	Didi Furiyanto	didi_furiyanto	130800331	Compounding	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
c39c6003-2cf8-49a6-ad84-75f08ef993ca	2	Dimas Abi	dimas_abi	210400943	Filling	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
a37a2e3e-7d5c-4a2f-94b4-8393add6ba92	2	Dinna Nur	dinna_nur	210400942	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
f4e2f7a0-14c8-4325-8960-134be81a619f	2	Dion Riski	dion_riski	210400909	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
473ffb40-ed53-4d3c-85f4-23995acc62dc	2	Dony Setiawan	dony_setiawan	150300724	Compounding	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
b40bcb76-d248-492e-a7aa-d875dd8ee682	2	Dwi Robiyanto	dwi_robiyanto	200100149	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
635f89bb-24ce-41d3-8b95-e75dfb09f299	2	Dwi Sofyan	dwi_sofyan	230701193	Compounding	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
c52eab82-5bb3-428d-b828-c9f94a7fa16d	2	Edi Sopandi	edi_sopandi	130800405	Compounding	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
cb9b99ed-49d6-4a99-bd97-310a3620feba	2	Eko Nuryanto	eko_nuryanto	050100066	Weighing	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
547585d8-d54c-4498-9cd4-6561f8c1eadf	2	Eko Supandi	eko_supandi	230701194	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
943d6741-3911-4331-ad04-99a2be998360	2	Eko Teguh	eko_teguh	210400945	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
996c83ba-7704-42e8-be09-0ba6cb018c75	2	Endang Husni	endang_husni	130800367	Filling	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
4b6392b9-3290-4f87-bcbe-0b619fa35166	2	Epen Supendi	epen_supendi	030700090	Filling	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
546aba71-1042-477a-b4e9-f32b5e556e86	2	Eri Fauzan	eri_fauzan	210400935	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
6af2862e-6e2c-49e6-8967-f5ca7cf15caa	2	Eriek Hendriawan	eriek_hendriawan	020600085	Filling	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
eba4590e-51ab-4e6e-ba0f-a4885b8368dc	2	Erwin Saputro	erwin_saputro	130800410	Filling	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
6e99fdab-1ea3-49d6-9166-4067bb09d98e	2	Faizal Rachman	faizal_rachman	020500082	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
30b435d4-4e7f-495d-a54d-4211b271f62c	2	Ferry Yuli	ferry_yuli	210400947	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
552c31e3-ce03-4b12-8cca-6b0c40cc1a53	2	Fitriani Amelia	fitriani_amelia	210901964	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
edb15fe8-88d5-4ec3-892e-dca12a75e576	2	Fredi Setiawan	fredi_setiawan	200300613	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
2e3affcb-cef0-4229-81c3-c385807cd810	2	Gilang Budi	gilang_budi	230701195	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
f87bd1e8-f3e1-4aa1-b72b-895d1af48bb0	2	Hafaz Aminudin	hafaz_aminudin	211002194	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
8cd7a02e-d7aa-458a-9d60-7e61378a10f3	2	Haris Setiawan	haris_setiawan	221202416	Compounding	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
697b47fc-cba1-4b20-a5b7-179682ea3fa8	2	Harum Purnama	harum_purnama	211002192	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
88ce4bdb-eefc-49b9-ac89-bfa2ba05dd3d	2	Iwan Gunawan	iwan_gunawan	031100104	Filling	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
39483cf0-9784-419f-8a0f-e7ccb88ebf6e	2	Jefri Prima	jefri_prima	210400902	Filling	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
e9f088c1-ba56-4702-b9da-f4fe122f64d8	2	Junali Mustofa	junali_mustofa	210400894	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
572e597d-9a18-4377-b588-3e7e25bb1818	2	Khoerur Rozikin	khoerur_rozikin	221202205	Filling	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
52f904fa-cf14-4d0e-91a2-c832d848c810	2	Komarudin	komarudin	210400937	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
c82af081-ddc9-4189-a6bd-38816759d526	2	Kustiawan Purnama	kustiawan_purnama	130800400	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
7127a331-f59e-47c4-b6ae-44eaf4940cff	2	Lungguh Among	lungguh_among	210400913	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
b85ed548-40a4-4bfc-b169-49ad72bac30d	2	Maryadih	maryadih	030500083	Filling	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
e4c549ef-20f6-4710-bd46-decf486fbc5e	2	Akhid Romdhoni	akhid	$2a$10$S2.0u0.6EEvA4Bk./UujAe8CTFBWzujCn4VO4HGO1eOHIz3CoybRq	Compounding	t	2026-04-09 08:48:40.357885+00	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
b13a95fd-c142-44a2-9b8d-4bd845ab8619	2	Mayrandi	mayrandi	200300846	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
86aadca2-7a46-48c4-84ad-62145005939c	2	Mochammad Nangim	nangim	230701201	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
27529ffb-f735-4506-b09e-d3d5435a03a9	2	Moh Rizal	moh_rizal	230801445	Compounding	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
2ce36cb7-6132-4c4b-bd76-ebf98f404180	2	Muhamad Albadri	m_albadri	050800075	Filling	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
9e128eee-cd94-4089-a211-4236991f1aa5	2	Muhamad Hasan	m_hasan	230601013	Weighing	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
9510dedd-b321-4369-86fb-a5406ffcd792	2	Muhamad Lutpi	m_lutpi	210401124	Filling	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
6a583c10-6305-4b6d-9ced-80d757024f97	2	Muhamad Rizal	m_rizal	221202418	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
25994110-0949-423d-a7b2-40ec82aa39c6	2	Muhamad Vicky	m_vicky	210400899	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
8763c5a2-157a-450b-9f7d-06f134f451c8	2	Muhamad Adnan	m_adnan	190802345	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
06a06499-a3eb-483e-ba9f-95e9c4e73ae0	2	Muhamad Cahyadi	m_cahyadi	230701203	Filling	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
7a97d343-d92e-45ea-b99f-61fb65188c9c	2	Muhamad Fadjar	m_fadjar	200200344	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
617bfc60-0f3c-45c8-90cc-7174a1aa59e1	2	Muhamad Ihtisamudin	m_ihtisamudin	210400903	Filling	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
8cecfe2c-3624-44cc-9c70-8dd8f779e840	2	Nirwanto	nirwanto	130800334	Compounding	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
ed857f67-5027-456d-9c93-480395016454	2	Nita Fitantri	nita_fitantri	140200290	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
c0f389c1-e69d-4667-9149-87675aa20ab1	2	Nur Hidayat	nur_hidayat	210400910	Filling	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
adc37d30-d68e-480f-ada9-f3ec7d9f0f49	2	Pebri Hardiansyah	pebri_hardiansyah	210501208	Weighing	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
7522d3bb-2afd-4a26-90d2-eaf4f8bb1044	2	Piona Br	piona_br	230801447	Filling	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
ebfa4a61-0b62-47e8-a1fa-253f9b72aaaf	2	Pirman Taopik	pirman_taopik	210400946	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
f9f5c47f-61dc-4800-8702-b594746ee12d	2	Rachmad Diyanto	rachmad_diyanto	130800402	Weighing	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
e9996738-ef9d-4a63-b33e-04a755223cf3	2	Rachmat Indarto	rachmat_indarto	000900100	Compounding	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
7ce10193-88b1-4e96-b1f9-26eaf78b5a41	2	Ramadhoni Putra	ramadhoni_putra	210801774	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
8106ee7e-ab56-4f9d-9384-1f734a632f79	2	Reza Nova	reza_nova	210400887	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
84ebe827-0bed-4d3b-885f-0e2ecaa8d6f0	2	Rifki Hidayat	rifki_hidayat	210400932	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
419c11d4-5a46-4319-ad4f-15ab92673c26	2	Rikhi Falya	rikhi_falya	230701204	Weighing	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
11f70303-9f80-4152-aeb8-7115e818ada6	2	Rio Octa	rio_octa	230500719	Filling	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
e8754e27-98c7-462b-8e45-7cf030601558	2	Rival Agus	rival_agus	210400897	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
3a067cca-8f7c-4c04-a663-4453245474d0	2	Rizkhy Budi	rizkhy_budi	240400992	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
0797dbfb-6439-4490-818e-8eab1c622f9e	2	Rizki Rianjani	rizki_rianjani	210801775	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
610283e5-2d74-48e5-ad13-14998813a705	2	Rizky Fauzi	rizky_fauzi	210400901	Filling	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
fc84c2ac-fe91-4b33-9aef-5745bf30262b	2	Rizqi	rizqi	210400951	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
8f5e1c32-63a6-4e40-adf1-4804fa69ae07	2	Rubadin	rubadin	200801687	Compounding	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
c5ab3aa8-77ee-4bbb-8828-a6bf9f0ae8f5	2	Sabar Ferianto	sabar_ferianto	210400891	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
7412c41f-09dc-4b8d-999a-334e3422bd53	2	Saeful Hidayat	saeful_hidayat	120300255	Compounding	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
859c6483-e3b9-4ead-9a0c-a1299141460b	2	Saepludin	saepludin	210501207	Compounding	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
2474cead-e0f7-43d6-8c85-6ae235353b5c	2	Sefril Singgih	sefril_singgih	210400898	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
818f9ade-8a91-474e-9cd5-db444c8ec4d2	2	Septi Andi	septi_andi	130800372	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
29c3bf8e-e3c6-4db3-9976-7df3b966e662	2	Setri Nando	setri_nando	221202419	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
1902074b-811e-46c7-aa5d-f55a6d7e298d	2	Sobar Budi	sobar_budi	210400900	Filling	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
f3a54a8f-75d0-4924-9ce7-386d8568f3ca	2	Sugiarto	sugiarto	030900098	Filling	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
46461da4-8fc3-44ba-aca4-819b1fac6940	2	Suhendro	suhendro	030800095	Weighing	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
8fe6adbd-b2f9-4dff-b577-5e1d64dd43ea	2	Sumarno	sumarno	971200063	Filling	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
dacc25bd-edbc-480d-953c-103abd5654b2	2	Suryana	suryana	030900101	Filling	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
b9d61c01-c652-4373-9003-f367e074cd84	2	Sutrisno	sutrisno	000400091	Filling	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
d92ab3de-82ed-4d23-abb4-8d37dfbd78c9	2	Sutrisno2	sutrisno2	130800404	Filling	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
5d14b9fc-763a-47af-aa69-ca6ab2dc4c7a	2	Toni Darmoko	toni_darmoko	130800406	Compounding	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
1647a5bd-47dd-4ad6-8f7e-e0f0b9db1d58	2	Tri Adek	tri_adek	210400892	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
84bd8718-4cf5-42cd-be55-c5aacf8190b2	2	Tri Hastono	tri_hastono	210400915	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
542b226f-4b73-44d5-ac22-f75731392071	2	Turi Suyadi	turi_suyadi	030700091	Filling	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
07f7fc7d-4391-4638-8e67-2b166ce5d024	2	Umar Fani	umar_fani	210400948	Filling	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
209b3c9c-08ff-4e2d-92bf-39aca106c899	2	Vernando Adi	vernando_adi	210300736	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
1278e230-0f32-4a8c-a6ef-369fefa0587e	2	Vissi Peace	vissi_peace	210400893	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
4d82c851-7de7-443b-bc67-635a6f6a4c5b	2	Wahyu Ari	wahyu_ari	161101522	Filling	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
995bf72f-622b-4e34-a420-e0fed372966c	2	Wahyu Nur	wahyu_nur	221001978	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
2b0e1014-be82-4819-ab41-0020f9371155	2	Wiwit Iwan	wiwit_iwan	080400080	Filling	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
88b8916b-6d05-43d9-b67d-11f63e01a96a	2	X Kokoh	x_kokoh	210400916	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
e92f9ff7-0211-4f6c-8acb-589dffa3aac2	2	Yo Suaeb	yo_suaeb	210400931	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
1957e112-60b0-40c2-bc3c-a6a7c032cf6c	2	Yoesoef Ardiana	yoesoef_ardiana	211002191	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
6aaddec9-aa89-4c38-8d09-ce24e770889c	2	Yolanda Rizky	yolanda_rizky	210901961	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
bc2d2202-23f6-4b7c-b342-a73258294f11	2	Yudhi Irawan	yudhi_irawan	210400949	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
2fe07f9c-af01-4d84-a7b6-ea31fe5441d8	2	Yusuf Alviansyah	yusuf_alviansyah	230701207	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
fde50740-1520-4205-aac2-ff66e4f4119b	2	NUNU FATHUR ROHMAN	nunu_fathur	202404111	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
a3e3dfa3-4973-4fe6-bf7c-60e336b1dc94	2	BUDI SAPUTRO	budi_saputro	202404112	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
5a46bb60-d453-4b3f-bbbb-b17cf147e9a9	2	AFWAN MIFTAHUL KHOIR	afwan_miftahul	202404113	Compounding	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
963f65e0-43b9-4323-baa4-e635ffdbaca7	2	YUSUF ARDHIANSYAH	yusuf_ardhiansyah	202404114	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
cf817bc4-8bf4-4c74-a03d-20e795e64be4	2	NUR WENDI UTOMO	nur_wendi	202404116	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
d08ec121-b98c-45ed-8422-e4a84f0e1627	2	SONY WIJAYA PUTRA	sony_wijaya	202404120	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
1c222c06-bbfd-436a-a03a-f8833c9ddc3d	2	M. DAFA WARDANA	m_dafa	202404121	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
bd08ca62-9f74-4234-b2f2-e0bba307e04b	2	ANDRIANSYAH	andriansyah	202404123	Compounding	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
8890797b-f190-4d45-af25-030f299be245	2	MOHAMAD AJIJI	m_ajiji	202404124	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
3994a647-3840-4c87-a138-ad92c675bae2	4	Hari Wahyudi	hari_wahyudi	elisa2026	Site Head	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
c9dd9338-6f9f-4412-ac9d-f9f64867b06a	2	Shalsabila Qowlam Fadila	shalsabila	240200360	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
ae6a81ef-1815-4ccd-9415-42e739fb4950	2	Siscka Rustanti	siscka	240400807	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
ddb8ba49-e4be-4209-bdc9-d5e7ef2fcb40	2	Aura Hidayah Luffy	aura	240400852	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
b5d16a3e-3c4f-4d8f-b703-f23b827ddd33	2	Ryan Budiyanto	ryan	240400817	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
495093c7-2e66-49de-af04-e409b350aa45	2	Joko Dwi Rahmadi	joko_dwi	240400833	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
8950eccc-9f85-4dde-8a2c-6ce6657e8df8	2	Twenry Siallagan	twenry	210300770	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
80fe6717-fc09-4cc2-888c-8b2a5025aadd	2	Mahfud Hisyam	mahfud_hisyam	202502012	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
6baaa9d0-8386-4e53-a6e7-ae025bfd5160	2	Yoga praniko	yoga_praniko	202502014	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
4e003313-13c3-4fb2-9014-502786dad062	2	Fega bagus saputro	fega_bagus	202502023	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
61115e92-f5d9-4b6b-9282-5f0a46acb3c2	2	Andris Kholiq firmanysah	andris_kholiq	202502013	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
f697a2dd-6579-46a9-9629-49a4426fbdfc	2	Muhammad nizar azzufa	m_nizar	202502019	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
b46351f3-d3bd-471b-a2db-2559cffe8fb0	2	Randa septi harmonika	randa_septi	202502016	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
925ad95b-0c79-4139-95df-0f5735a85481	2	Rico budiarto	rico_budiarto	202502018	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
93b9299e-ad24-441a-9967-3c85195ad1f8	2	Brian a'an prasityio	brian_prasityio	202502022	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
1a453ddf-0050-45d0-ab07-cb7d33b5f247	2	Rezi Permana	rezi_permana	202502020	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
b900cb3c-221f-449d-983e-7e9832799106	2	Akhyar ni'mal roaena	akhyar_roaena	202502017	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
8db5095a-4761-4b58-820f-a7907f12bfd9	2	Lulus Sabdo pangestu	lulus_sabdo	202502021	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
ce15bc0c-8af9-4d44-9acb-5334cde5dff7	2	Aziz Al Awal	aziz_alawal	202411182	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
517ea91f-e1c2-4bbe-aaa8-45e4f77c6bc4	2	Ruhudin Teguh	ruhudin_teguh	202411181	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
c9209d58-085a-4a05-9bca-5a35e2693b0e	2	Reihan	reihan	202501004	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
ca7e78bc-3b9c-4964-9e74-b0d19a0df3e2	2	Faqih Setiawan	faqih_setiawan	202410170	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
6556fd89-a089-43f5-93c0-69eeb8961ad2	2	Arie Dwi	arie_dwi	202408151	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
b8871e5a-36d0-4ccb-ac4a-2493b5b59142	2	Muhammad Afifudin	m_afifudin	202480152	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
d0c743f9-1ec1-49d8-aaeb-d8d9a67d4225	2	muhammad aldien shahizidan	m_aldien	202408153	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
fafd51d2-86cd-4f80-b9f8-46d082ef8444	2	oktavianus agung prabowo	agung_prabowo	202408154	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
950c5ae2-3e17-49f2-bd7e-74c4fa280c83	2	anas abdullah	anas_abdullah	202411180	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
a3a84157-1d71-428e-82c5-a0890262d995	2	fajar saebani maulana alim	fajar_saebani	202411183	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
3b291142-7df0-4178-8288-8dd4f308b507	2	ADI WIJAYA SANTOSO	adi_wijaya	202506097	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
05f7d9bb-d820-42ff-8961-c65885549d16	2	GOZALI FIRGIAWAN	gozali	202506095	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
f0555ef5-266e-4676-99b9-42eae438bf7d	2	RAFIQ AKMAL FAHREZA	rafiq_akmal	202506098	Packaging	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
15682ffb-7ff7-4353-8c78-ceb148e2a57d	1	IT Admin	admin	$2a$10$RUkanpWidhn/0HcG.rop.Om94bzEmPyNuGDD1LQgDQqWrw0.bCJ1m	IT	t	2026-04-09 06:42:45.901481+00	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
c3568848-1d93-49b6-80a9-cdb3018b556a	1	Valdey	valdey	$2a$10$mhjDItVZn4IDoREBcr6OG.IopHwORLLc7u4ML1aXDZoXTuQrdrH5C	Developer	t	2026-04-09 08:44:05.786769+00	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
2157fcac-e3a7-4981-8ffb-36fdec4fad61	1	Yoga	yoga	$2a$10$WaOv8cu94a8MBLaiQsqEJOGej/6KN9jIQD6yJqOYjcQPGeCsTjE2S	Developer	t	2026-04-13 00:28:50.723116+00	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
f548de75-3c0b-4302-874f-6e1edb4c778d	5	Elvi Suzy	elvi_suzy	970200066	Manager Produksi	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
79567498-2d13-4576-82ee-39ef5919a11e	5	Yudi	yudi	160101132	Supervisor	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
56ea4c1a-446c-4786-b320-3edc32dcc3fe	5	Joko Santoso	joko_santoso	161001487	Supervisor	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
67df347c-bbf2-4704-abff-1fa2171d13d6	5	Zainudin	zainudin	970700068	Supervisor	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
4c63e388-95f0-439b-bf31-03d52210d23e	5	Fidelia Diva	fidelia_diva	230600927	Supervisor	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
999b7c36-e8a4-4192-a222-5ff445712a5a	5	M Rizky	m_rizky	130800441	Supervisor	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
ace52697-f191-42cb-84db-425e4a41698e	5	Hafidh Dimas	hafidh_dimas	240200355	Supervisor	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
9b62cb8b-df1c-4024-a58e-a31d1a62573f	5	Michael Wibawa	mwa	Bintang7	Manager Prod	t	\N	2026-04-09 06:12:28.323402+00	2026-04-09 06:12:28.323402+00
\.


--
-- Name: areas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: elisa_user
--

SELECT pg_catalog.setval('public.areas_id_seq', 37, true);


--
-- Name: checklist_stages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: elisa_user
--

SELECT pg_catalog.setval('public.checklist_stages_id_seq', 7, true);


--
-- Name: floor_config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: elisa_user
--

SELECT pg_catalog.setval('public.floor_config_id_seq', 4, true);


--
-- Name: lines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: elisa_user
--

SELECT pg_catalog.setval('public.lines_id_seq', 16, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: elisa_user
--

SELECT pg_catalog.setval('public.roles_id_seq', 5, true);


--
-- Name: areas areas_pkey; Type: CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.areas
    ADD CONSTRAINT areas_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: checklist_items checklist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.checklist_items
    ADD CONSTRAINT checklist_items_pkey PRIMARY KEY (id);


--
-- Name: checklist_parts checklist_parts_pkey; Type: CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.checklist_parts
    ADD CONSTRAINT checklist_parts_pkey PRIMARY KEY (id);


--
-- Name: checklist_stages checklist_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.checklist_stages
    ADD CONSTRAINT checklist_stages_pkey PRIMARY KEY (id);


--
-- Name: cleaning_records cleaning_records_pkey; Type: CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.cleaning_records
    ADD CONSTRAINT cleaning_records_pkey PRIMARY KEY (id);


--
-- Name: cleaning_schedule cleaning_schedule_machine_id_key; Type: CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.cleaning_schedule
    ADD CONSTRAINT cleaning_schedule_machine_id_key UNIQUE (machine_id);


--
-- Name: cleaning_schedule cleaning_schedule_pkey; Type: CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.cleaning_schedule
    ADD CONSTRAINT cleaning_schedule_pkey PRIMARY KEY (id);


--
-- Name: floor_config floor_config_pkey; Type: CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.floor_config
    ADD CONSTRAINT floor_config_pkey PRIMARY KEY (id);


--
-- Name: lines lines_pkey; Type: CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.lines
    ADD CONSTRAINT lines_pkey PRIMARY KEY (id);


--
-- Name: machine_parts machine_parts_pkey; Type: CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.machine_parts
    ADD CONSTRAINT machine_parts_pkey PRIMARY KEY (id);


--
-- Name: machines machines_machine_code_key; Type: CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.machines
    ADD CONSTRAINT machines_machine_code_key UNIQUE (machine_code);


--
-- Name: machines machines_pkey; Type: CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.machines
    ADD CONSTRAINT machines_pkey PRIMARY KEY (id);


--
-- Name: qa_verifications qa_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.qa_verifications
    ADD CONSTRAINT qa_verifications_pkey PRIMARY KEY (id);


--
-- Name: qa_verifications qa_verifications_record_id_key; Type: CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.qa_verifications
    ADD CONSTRAINT qa_verifications_record_id_key UNIQUE (record_id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: room_readiness_lembar_review room_readiness_lembar_review_pkey; Type: CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.room_readiness_lembar_review
    ADD CONSTRAINT room_readiness_lembar_review_pkey PRIMARY KEY (id);


--
-- Name: room_readiness_reviews room_readiness_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.room_readiness_reviews
    ADD CONSTRAINT room_readiness_reviews_pkey PRIMARY KEY (id);


--
-- Name: suhu_rh suhu_rh_pkey; Type: CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.suhu_rh
    ADD CONSTRAINT suhu_rh_pkey PRIMARY KEY (id);


--
-- Name: telegram_notifications telegram_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.telegram_notifications
    ADD CONSTRAINT telegram_notifications_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_audit_logs_action; Type: INDEX; Schema: public; Owner: elisa_user
--

CREATE INDEX idx_audit_logs_action ON public.audit_logs USING btree (action);


--
-- Name: idx_audit_logs_created_at; Type: INDEX; Schema: public; Owner: elisa_user
--

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at DESC);


--
-- Name: idx_audit_logs_user_id; Type: INDEX; Schema: public; Owner: elisa_user
--

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs USING btree (user_id);


--
-- Name: idx_checklist_items_record_id; Type: INDEX; Schema: public; Owner: elisa_user
--

CREATE INDEX idx_checklist_items_record_id ON public.checklist_items USING btree (record_id);


--
-- Name: idx_cleaning_records_date; Type: INDEX; Schema: public; Owner: elisa_user
--

CREATE INDEX idx_cleaning_records_date ON public.cleaning_records USING btree (cleaning_date DESC);


--
-- Name: idx_cleaning_records_machine_id; Type: INDEX; Schema: public; Owner: elisa_user
--

CREATE INDEX idx_cleaning_records_machine_id ON public.cleaning_records USING btree (machine_id);


--
-- Name: idx_cleaning_records_status; Type: INDEX; Schema: public; Owner: elisa_user
--

CREATE INDEX idx_cleaning_records_status ON public.cleaning_records USING btree (status);


--
-- Name: idx_machines_area_id; Type: INDEX; Schema: public; Owner: elisa_user
--

CREATE INDEX idx_machines_area_id ON public.machines USING btree (area_id);


--
-- Name: idx_machines_is_active; Type: INDEX; Schema: public; Owner: elisa_user
--

CREATE INDEX idx_machines_is_active ON public.machines USING btree (is_active);


--
-- Name: idx_suhu_rh_line_id; Type: INDEX; Schema: public; Owner: elisa_user
--

CREATE INDEX idx_suhu_rh_line_id ON public.suhu_rh USING btree (line_id);


--
-- Name: idx_suhu_rh_synced_at; Type: INDEX; Schema: public; Owner: elisa_user
--

CREATE INDEX idx_suhu_rh_synced_at ON public.suhu_rh USING btree (synced_at DESC);


--
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: elisa_user
--

CREATE INDEX idx_users_username ON public.users USING btree (username);


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: checklist_items checklist_items_part_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.checklist_items
    ADD CONSTRAINT checklist_items_part_id_fkey FOREIGN KEY (part_id) REFERENCES public.checklist_parts(id);


--
-- Name: checklist_items checklist_items_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.checklist_items
    ADD CONSTRAINT checklist_items_record_id_fkey FOREIGN KEY (record_id) REFERENCES public.cleaning_records(id) ON DELETE CASCADE;


--
-- Name: checklist_items checklist_items_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.checklist_items
    ADD CONSTRAINT checklist_items_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.checklist_stages(id);


--
-- Name: checklist_parts checklist_parts_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.checklist_parts
    ADD CONSTRAINT checklist_parts_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: checklist_parts checklist_parts_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.checklist_parts
    ADD CONSTRAINT checklist_parts_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.checklist_stages(id);


--
-- Name: cleaning_records cleaning_records_area_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.cleaning_records
    ADD CONSTRAINT cleaning_records_area_id_fkey FOREIGN KEY (area_id) REFERENCES public.areas(id);


--
-- Name: cleaning_records cleaning_records_machine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.cleaning_records
    ADD CONSTRAINT cleaning_records_machine_id_fkey FOREIGN KEY (machine_id) REFERENCES public.machines(id);


--
-- Name: cleaning_records cleaning_records_operator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.cleaning_records
    ADD CONSTRAINT cleaning_records_operator_id_fkey FOREIGN KEY (operator_id) REFERENCES public.users(id);


--
-- Name: cleaning_schedule cleaning_schedule_last_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.cleaning_schedule
    ADD CONSTRAINT cleaning_schedule_last_record_id_fkey FOREIGN KEY (last_record_id) REFERENCES public.cleaning_records(id);


--
-- Name: cleaning_schedule cleaning_schedule_machine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.cleaning_schedule
    ADD CONSTRAINT cleaning_schedule_machine_id_fkey FOREIGN KEY (machine_id) REFERENCES public.machines(id);


--
-- Name: floor_config floor_config_area_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.floor_config
    ADD CONSTRAINT floor_config_area_id_fkey FOREIGN KEY (area_id) REFERENCES public.areas(id);


--
-- Name: floor_config floor_config_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.floor_config
    ADD CONSTRAINT floor_config_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: lines lines_area_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.lines
    ADD CONSTRAINT lines_area_id_fkey FOREIGN KEY (area_id) REFERENCES public.areas(id);


--
-- Name: machine_parts machine_parts_machine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.machine_parts
    ADD CONSTRAINT machine_parts_machine_id_fkey FOREIGN KEY (machine_id) REFERENCES public.machines(id) ON DELETE CASCADE;


--
-- Name: machines machines_area_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.machines
    ADD CONSTRAINT machines_area_id_fkey FOREIGN KEY (area_id) REFERENCES public.areas(id);


--
-- Name: machines machines_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.machines
    ADD CONSTRAINT machines_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: machines machines_line_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.machines
    ADD CONSTRAINT machines_line_id_fkey FOREIGN KEY (line_id) REFERENCES public.lines(id);


--
-- Name: qa_verifications qa_verifications_qa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.qa_verifications
    ADD CONSTRAINT qa_verifications_qa_id_fkey FOREIGN KEY (qa_id) REFERENCES public.users(id);


--
-- Name: qa_verifications qa_verifications_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.qa_verifications
    ADD CONSTRAINT qa_verifications_record_id_fkey FOREIGN KEY (record_id) REFERENCES public.cleaning_records(id);


--
-- Name: reports reports_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: reports reports_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_record_id_fkey FOREIGN KEY (record_id) REFERENCES public.cleaning_records(id);


--
-- Name: room_readiness_lembar_review room_readiness_lembar_review_area_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.room_readiness_lembar_review
    ADD CONSTRAINT room_readiness_lembar_review_area_id_fkey FOREIGN KEY (area_id) REFERENCES public.areas(id);


--
-- Name: room_readiness_lembar_review room_readiness_lembar_review_submitted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.room_readiness_lembar_review
    ADD CONSTRAINT room_readiness_lembar_review_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES public.users(id);


--
-- Name: room_readiness_reviews room_readiness_reviews_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.room_readiness_reviews
    ADD CONSTRAINT room_readiness_reviews_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- Name: room_readiness_reviews room_readiness_reviews_suhu_rh_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.room_readiness_reviews
    ADD CONSTRAINT room_readiness_reviews_suhu_rh_id_fkey FOREIGN KEY (suhu_rh_id) REFERENCES public.suhu_rh(id);


--
-- Name: suhu_rh suhu_rh_line_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.suhu_rh
    ADD CONSTRAINT suhu_rh_line_id_fkey FOREIGN KEY (line_id) REFERENCES public.lines(id);


--
-- Name: suhu_rh suhu_rh_machine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.suhu_rh
    ADD CONSTRAINT suhu_rh_machine_id_fkey FOREIGN KEY (machine_id) REFERENCES public.machines(id);


--
-- Name: telegram_notifications telegram_notifications_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.telegram_notifications
    ADD CONSTRAINT telegram_notifications_record_id_fkey FOREIGN KEY (record_id) REFERENCES public.cleaning_records(id);


--
-- Name: telegram_notifications telegram_notifications_review_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.telegram_notifications
    ADD CONSTRAINT telegram_notifications_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.room_readiness_reviews(id);


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: elisa_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- PostgreSQL database dump complete
--

\unrestrict 0R5Ebh2741h89Vcd1jq5ANEpiLT2Sjfly9PfY8UMt1yYW2P4FX4yT0AEbxSGREX

