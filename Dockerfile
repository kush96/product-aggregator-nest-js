# Step 1: Use Node.js as the base image
FROM node:18-alpine

# Step 2: Install PostgreSQL, git, bash, and su-exec
RUN apk add --no-cache postgresql postgresql-contrib git bash su-exec

# Step 3: Set environment variables for Postgres + Prisma
ENV POSTGRES_USER=kushsingh
ENV POSTGRES_DB=postgres
ENV DATABASE_URL=postgresql://kushsingh@localhost:5432/postgres

# Step 4: Create directories for Postgres; own them by the postgres user
RUN mkdir -p /var/lib/postgresql/data /run/postgresql && \
    chown -R postgres:postgres /var/lib/postgresql /run/postgresql && \
    chmod 775 /run/postgresql

# Step 5: Set the working directory and clone your repo
WORKDIR /app
RUN git clone https://github.com/kush96/product-aggregator-nest-js.git .

# Step 6: Install dependencies and generate the Prisma client
RUN npm install
RUN npx prisma generate

# Step 7: Expose necessary ports
EXPOSE 3000
EXPOSE 4000
EXPOSE 5432

# Step 8: Launch everything as root, but switch to postgres only for DB commands
CMD ["sh", "-c", " \
  # 1) Initialize the DB as 'postgres' user
  su-exec postgres initdb -D /var/lib/postgresql/data && \
  # 2) Start the Postgres server as 'postgres'
  su-exec postgres pg_ctl -D /var/lib/postgresql/data -o '-p 5432' -w start && \
  # 3) Create the role 'kushsingh' if it doesn't exist
  su-exec postgres createuser -s kushsingh || true && \
  # 4) Run migrations (DB already exists by default: 'postgres')
  npx prisma migrate deploy && \
  # 5) Start two Nest debug instances
  npx concurrently \"PORT=3000 npm run start:debug\" \"PORT=4000 npm run start:debug\" \
"]
