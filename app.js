const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());
let db = null;

let dbPath = path.join(__dirname, "cricketTeam.db");
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000);
  } catch (error) {
    console.log(`DB Error:${error.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const getCricketTeamQuery = `
        SELECT
            *
        FROM
            cricket_team;
    `;
  const teamArray = await db.all(getCricketTeamQuery);

  response.send(
    teamArray.map((eachItem) => convertDbObjectToResponseObject(eachItem))
  );
});

//GET PLAYER
app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
            SELECT
                *
            FROM
                cricket_team
            WHERE
                player_id = ${playerId};

    `;
  const getQuery = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(getQuery));
});

app.post("/players/", async (request, response) => {
  const cricketTeamDetails = request.body;
  const { playerName, jerseyNumber, role } = cricketTeamDetails;
  const addCricketQuery = `
        INSERT INTO
            cricket_team(player_name, jersey_number, role)
        VALUES
            (
               
                '${playerName}',
                ${jerseyNumber},
                '${role}'
            );
  
  `;
  const dbResponse = await db.run(addCricketQuery);
  const player_id = dbResponse.lastID;
  response.send("Player Added to Team");
});

//UPDATE PLAYER(PUT)
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `
        UPDATE
            cricket_team
        SET
            player_name = '${playerName}',
            jersey_number = ${jerseyNumber},
            role = '${role}'
        WHERE
            player_id = ${playerId};
    
    `;

  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `
        DELETE FROM
            cricket_team
        WHERE
            player_id = ${playerId}
    
    `;
  await db.run(deleteQuery);
  response.send("Player Removed");
});

module.exports = app;
