(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    var exp = factory();
    root.TOP_PLAYERS_DATA = exp.TOP_PLAYERS_DATA;
    root.normalizeSearchText = exp.normalizeSearchText;
    root.searchPlayers = exp.searchPlayers;
    root.searchCompetitions = exp.searchCompetitions;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function normalizeSearchText(text) {
    if (!text) return '';
    return String(text)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ø/g, 'o')
      .replace(/æ/g, 'ae')
      .replace(/œ/g, 'oe')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  var TOP_PLAYERS_DATA = [
    // --- Premier League ---
    // Manchester City
    { name: 'Erling Haaland', team: 'Manchester City', teamCode: 'MCI', league: 'eng.1', position: 'FW', jersey: 9, country: 'Norway', flag: '🇳🇴' },
    { name: 'Kevin De Bruyne', team: 'Manchester City', teamCode: 'MCI', league: 'eng.1', position: 'MF', jersey: 17, country: 'Belgium', flag: '🇧🇪' },
    { name: 'Phil Foden', team: 'Manchester City', teamCode: 'MCI', league: 'eng.1', position: 'MF', jersey: 47, country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { name: 'Rodri', team: 'Manchester City', teamCode: 'MCI', league: 'eng.1', position: 'MF', jersey: 16, country: 'Spain', flag: '🇪🇸' },
    { name: 'Bernardo Silva', team: 'Manchester City', teamCode: 'MCI', league: 'eng.1', position: 'MF', jersey: 20, country: 'Portugal', flag: '🇵🇹' },
    { name: 'Jack Grealish', team: 'Manchester City', teamCode: 'MCI', league: 'eng.1', position: 'FW', jersey: 10, country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { name: 'Josko Gvardiol', team: 'Manchester City', teamCode: 'MCI', league: 'eng.1', position: 'DF', jersey: 24, country: 'Croatia', flag: '🇭🇷' },
    { name: 'Ruben Dias', team: 'Manchester City', teamCode: 'MCI', league: 'eng.1', position: 'DF', jersey: 3, country: 'Portugal', flag: '🇵🇹' },
    { name: 'Ederson', team: 'Manchester City', teamCode: 'MCI', league: 'eng.1', position: 'GK', jersey: 31, country: 'Brazil', flag: '🇧🇷' },

    // Arsenal
    { name: 'Bukayo Saka', team: 'Arsenal', teamCode: 'ARS', league: 'eng.1', position: 'FW', jersey: 7, country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { name: 'Martin Ødegaard', team: 'Arsenal', teamCode: 'ARS', league: 'eng.1', position: 'MF', jersey: 8, country: 'Norway', flag: '🇳🇴' },
    { name: 'Declan Rice', team: 'Arsenal', teamCode: 'ARS', league: 'eng.1', position: 'MF', jersey: 41, country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { name: 'Kai Havertz', team: 'Arsenal', teamCode: 'ARS', league: 'eng.1', position: 'FW', jersey: 29, country: 'Germany', flag: '🇩🇪' },
    { name: 'Gabriel Martinelli', team: 'Arsenal', teamCode: 'ARS', league: 'eng.1', position: 'FW', jersey: 11, country: 'Brazil', flag: '🇧🇷' },
    { name: 'William Saliba', team: 'Arsenal', teamCode: 'ARS', league: 'eng.1', position: 'DF', jersey: 2, country: 'France', flag: '🇫🇷' },
    { name: 'Gabriel Magalhães', team: 'Arsenal', teamCode: 'ARS', league: 'eng.1', position: 'DF', jersey: 6, country: 'Brazil', flag: '🇧🇷' },
    { name: 'David Raya', team: 'Arsenal', teamCode: 'ARS', league: 'eng.1', position: 'GK', jersey: 22, country: 'Spain', flag: '🇪🇸' },
    { name: 'Leandro Trossard', team: 'Arsenal', teamCode: 'ARS', league: 'eng.1', position: 'FW', jersey: 19, country: 'Belgium', flag: '🇧🇪' },

    // Liverpool
    { name: 'Mohamed Salah', team: 'Liverpool', teamCode: 'LIV', league: 'eng.1', position: 'FW', jersey: 11, country: 'Egypt', flag: '🇪🇬' },
    { name: 'Luis Díaz', team: 'Liverpool', teamCode: 'LIV', league: 'eng.1', position: 'FW', jersey: 7, country: 'Colombia', flag: '🇨🇴' },
    { name: 'Darwin Núñez', team: 'Liverpool', teamCode: 'LIV', league: 'eng.1', position: 'FW', jersey: 9, country: 'Uruguay', flag: '🇺🇾' },
    { name: 'Cody Gakpo', team: 'Liverpool', teamCode: 'LIV', league: 'eng.1', position: 'FW', jersey: 18, country: 'Netherlands', flag: '🇳🇱' },
    { name: 'Trent Alexander-Arnold', team: 'Liverpool', teamCode: 'LIV', league: 'eng.1', position: 'DF', jersey: 66, country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { name: 'Virgil van Dijk', team: 'Liverpool', teamCode: 'LIV', league: 'eng.1', position: 'DF', jersey: 4, country: 'Netherlands', flag: '🇳🇱' },
    { name: 'Alexis Mac Allister', team: 'Liverpool', teamCode: 'LIV', league: 'eng.1', position: 'MF', jersey: 10, country: 'Argentina', flag: '🇦🇷' },
    { name: 'Dominik Szoboszlai', team: 'Liverpool', teamCode: 'LIV', league: 'eng.1', position: 'MF', jersey: 8, country: 'Hungary', flag: '🇭🇺' },
    { name: 'Alisson Becker', team: 'Liverpool', teamCode: 'LIV', league: 'eng.1', position: 'GK', jersey: 1, country: 'Brazil', flag: '🇧🇷' },

    // Chelsea
    { name: 'Cole Palmer', team: 'Chelsea', teamCode: 'CHE', league: 'eng.1', position: 'MF', jersey: 20, country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { name: 'Nicolas Jackson', team: 'Chelsea', teamCode: 'CHE', league: 'eng.1', position: 'FW', jersey: 15, country: 'Senegal', flag: '🇸🇳' },
    { name: 'Enzo Fernández', team: 'Chelsea', teamCode: 'CHE', league: 'eng.1', position: 'MF', jersey: 8, country: 'Argentina', flag: '🇦🇷' },
    { name: 'Moisés Caicedo', team: 'Chelsea', teamCode: 'CHE', league: 'eng.1', position: 'MF', jersey: 25, country: 'Ecuador', flag: '🇪🇨' },
    { name: 'Christopher Nkunku', team: 'Chelsea', teamCode: 'CHE', league: 'eng.1', position: 'FW', jersey: 18, country: 'France', flag: '🇫🇷' },
    { name: 'Reece James', team: 'Chelsea', teamCode: 'CHE', league: 'eng.1', position: 'DF', jersey: 24, country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },

    // Manchester United
    { name: 'Bruno Fernandes', team: 'Manchester United', teamCode: 'MUN', league: 'eng.1', position: 'MF', jersey: 8, country: 'Portugal', flag: '🇵🇹' },
    { name: 'Marcus Rashford', team: 'Manchester United', teamCode: 'MUN', league: 'eng.1', position: 'FW', jersey: 10, country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { name: 'Kobbie Mainoo', team: 'Manchester United', teamCode: 'MUN', league: 'eng.1', position: 'MF', jersey: 37, country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { name: 'Alejandro Garnacho', team: 'Manchester United', teamCode: 'MUN', league: 'eng.1', position: 'FW', jersey: 17, country: 'Argentina', flag: '🇦🇷' },
    { name: 'Rasmus Højlund', team: 'Manchester United', teamCode: 'MUN', league: 'eng.1', position: 'FW', jersey: 9, country: 'Denmark', flag: '🇩🇰' },
    { name: 'Lisandro Martínez', team: 'Manchester United', teamCode: 'MUN', league: 'eng.1', position: 'DF', jersey: 6, country: 'Argentina', flag: '🇦🇷' },
    { name: 'André Onana', team: 'Manchester United', teamCode: 'MUN', league: 'eng.1', position: 'GK', jersey: 24, country: 'Cameroon', flag: '🇨🇲' },

    // Tottenham Hotspur
    { name: 'Son Heung-min', team: 'Tottenham Hotspur', teamCode: 'TOT', league: 'eng.1', position: 'FW', jersey: 7, country: 'South Korea', flag: '🇰🇷' },
    { name: 'James Maddison', team: 'Tottenham Hotspur', teamCode: 'TOT', league: 'eng.1', position: 'MF', jersey: 10, country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { name: 'Dejan Kulusevski', team: 'Tottenham Hotspur', teamCode: 'TOT', league: 'eng.1', position: 'FW', jersey: 21, country: 'Sweden', flag: '🇸🇪' },
    { name: 'Cristian Romero', team: 'Tottenham Hotspur', teamCode: 'TOT', league: 'eng.1', position: 'DF', jersey: 17, country: 'Argentina', flag: '🇦🇷' },

    // Aston Villa & Newcastle
    { name: 'Ollie Watkins', team: 'Aston Villa', teamCode: 'AVL', league: 'eng.1', position: 'FW', jersey: 11, country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { name: 'Emiliano Martínez', team: 'Aston Villa', teamCode: 'AVL', league: 'eng.1', position: 'GK', jersey: 23, country: 'Argentina', flag: '🇦🇷' },
    { name: 'Alexander Isak', team: 'Newcastle United', teamCode: 'NEW', league: 'eng.1', position: 'FW', jersey: 14, country: 'Sweden', flag: '🇸🇪' },
    { name: 'Anthony Gordon', team: 'Newcastle United', teamCode: 'NEW', league: 'eng.1', position: 'FW', jersey: 10, country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { name: 'Bruno Guimarães', team: 'Newcastle United', teamCode: 'NEW', league: 'eng.1', position: 'MF', jersey: 39, country: 'Brazil', flag: '🇧🇷' },

    // --- Spanish LaLiga ---
    // Real Madrid
    { name: 'Kylian Mbappé', team: 'Real Madrid', teamCode: 'RMA', league: 'esp.1', position: 'FW', jersey: 9, country: 'France', flag: '🇫🇷' },
    { name: 'Vinícius Júnior', team: 'Real Madrid', teamCode: 'RMA', league: 'esp.1', position: 'FW', jersey: 7, country: 'Brazil', flag: '🇧🇷' },
    { name: 'Jude Bellingham', team: 'Real Madrid', teamCode: 'RMA', league: 'esp.1', position: 'MF', jersey: 5, country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { name: 'Rodrygo', team: 'Real Madrid', teamCode: 'RMA', league: 'esp.1', position: 'FW', jersey: 11, country: 'Brazil', flag: '🇧🇷' },
    { name: 'Federico Valverde', team: 'Real Madrid', teamCode: 'RMA', league: 'esp.1', position: 'MF', jersey: 8, country: 'Uruguay', flag: '🇺🇾' },
    { name: 'Luka Modrić', team: 'Real Madrid', teamCode: 'RMA', league: 'esp.1', position: 'MF', jersey: 10, country: 'Croatia', flag: '🇭🇷' },
    { name: 'Eduardo Camavinga', team: 'Real Madrid', teamCode: 'RMA', league: 'esp.1', position: 'MF', jersey: 6, country: 'France', flag: '🇫🇷' },
    { name: 'Aurélien Tchouaméni', team: 'Real Madrid', teamCode: 'RMA', league: 'esp.1', position: 'MF', jersey: 14, country: 'France', flag: '🇫🇷' },
    { name: 'Antonio Rüdiger', team: 'Real Madrid', teamCode: 'RMA', league: 'esp.1', position: 'DF', jersey: 22, country: 'Germany', flag: '🇩🇪' },
    { name: 'Thibaut Courtois', team: 'Real Madrid', teamCode: 'RMA', league: 'esp.1', position: 'GK', jersey: 1, country: 'Belgium', flag: '🇧🇪' },
    { name: 'Endrick', team: 'Real Madrid', teamCode: 'RMA', league: 'esp.1', position: 'FW', jersey: 16, country: 'Brazil', flag: '🇧🇷' },

    // Barcelona
    { name: 'Robert Lewandowski', team: 'Barcelona', teamCode: 'BAR', league: 'esp.1', position: 'FW', jersey: 9, country: 'Poland', flag: '🇵🇱' },
    { name: 'Lamine Yamal', team: 'Barcelona', teamCode: 'BAR', league: 'esp.1', position: 'FW', jersey: 19, country: 'Spain', flag: '🇪🇸' },
    { name: 'Raphinha', team: 'Barcelona', teamCode: 'BAR', league: 'esp.1', position: 'FW', jersey: 11, country: 'Brazil', flag: '🇧🇷' },
    { name: 'Pedri', team: 'Barcelona', teamCode: 'BAR', league: 'esp.1', position: 'MF', jersey: 8, country: 'Spain', flag: '🇪🇸' },
    { name: 'Gavi', team: 'Barcelona', teamCode: 'BAR', league: 'esp.1', position: 'MF', jersey: 6, country: 'Spain', flag: '🇪🇸' },
    { name: 'Dani Olmo', team: 'Barcelona', teamCode: 'BAR', league: 'esp.1', position: 'MF', jersey: 20, country: 'Spain', flag: '🇪🇸' },
    { name: 'Frenkie de Jong', team: 'Barcelona', teamCode: 'BAR', league: 'esp.1', position: 'MF', jersey: 21, country: 'Netherlands', flag: '🇳🇱' },
    { name: 'Jules Koundé', team: 'Barcelona', teamCode: 'BAR', league: 'esp.1', position: 'DF', jersey: 23, country: 'France', flag: '🇫🇷' },
    { name: 'Marc-André ter Stegen', team: 'Barcelona', teamCode: 'BAR', league: 'esp.1', position: 'GK', jersey: 1, country: 'Germany', flag: '🇩🇪' },

    // Atletico Madrid
    { name: 'Antoine Griezmann', team: 'Atlético Madrid', teamCode: 'ATM', league: 'esp.1', position: 'FW', jersey: 7, country: 'France', flag: '🇫🇷' },
    { name: 'Julián Álvarez', team: 'Atlético Madrid', teamCode: 'ATM', league: 'esp.1', position: 'FW', jersey: 19, country: 'Argentina', flag: '🇦🇷' },
    { name: 'Rodrigo De Paul', team: 'Atlético Madrid', teamCode: 'ATM', league: 'esp.1', position: 'MF', jersey: 5, country: 'Argentina', flag: '🇦🇷' },
    { name: 'Jan Oblak', team: 'Atlético Madrid', teamCode: 'ATM', league: 'esp.1', position: 'GK', jersey: 13, country: 'Slovenia', flag: '🇸🇮' },

    // --- German Bundesliga ---
    // Bayern Munich
    { name: 'Harry Kane', team: 'Bayern Munich', teamCode: 'BAY', league: 'ger.1', position: 'FW', jersey: 9, country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { name: 'Jamal Musiala', team: 'Bayern Munich', teamCode: 'BAY', league: 'ger.1', position: 'MF', jersey: 42, country: 'Germany', flag: '🇩🇪' },
    { name: 'Leroy Sané', team: 'Bayern Munich', teamCode: 'BAY', league: 'ger.1', position: 'FW', jersey: 10, country: 'Germany', flag: '🇩🇪' },
    { name: 'Michael Olise', team: 'Bayern Munich', teamCode: 'BAY', league: 'ger.1', position: 'FW', jersey: 17, country: 'France', flag: '🇫🇷' },
    { name: 'Joshua Kimmich', team: 'Bayern Munich', teamCode: 'BAY', league: 'ger.1', position: 'MF', jersey: 6, country: 'Germany', flag: '🇩🇪' },
    { name: 'Alphonso Davies', team: 'Bayern Munich', teamCode: 'BAY', league: 'ger.1', position: 'DF', jersey: 19, country: 'Canada', flag: '🇨🇦' },
    { name: 'Manuel Neuer', team: 'Bayern Munich', teamCode: 'BAY', league: 'ger.1', position: 'GK', jersey: 1, country: 'Germany', flag: '🇩🇪' },

    // Bayer Leverkusen & Dortmund & Stuttgart
    { name: 'Florian Wirtz', team: 'Bayer Leverkusen', teamCode: 'B04', league: 'ger.1', position: 'MF', jersey: 10, country: 'Germany', flag: '🇩🇪' },
    { name: 'Granit Xhaka', team: 'Bayer Leverkusen', teamCode: 'B04', league: 'ger.1', position: 'MF', jersey: 34, country: 'Switzerland', flag: '🇨🇭' },
    { name: 'Jeremie Frimpong', team: 'Bayer Leverkusen', teamCode: 'B04', league: 'ger.1', position: 'DF', jersey: 30, country: 'Netherlands', flag: '🇳🇱' },
    { name: 'Victor Boniface', team: 'Bayer Leverkusen', teamCode: 'B04', league: 'ger.1', position: 'FW', jersey: 22, country: 'Nigeria', flag: '🇳🇬' },
    { name: 'Serhou Guirassy', team: 'Borussia Dortmund', teamCode: 'BVB', league: 'ger.1', position: 'FW', jersey: 9, country: 'Guinea', flag: '🇬🇳' },
    { name: 'Julian Brandt', team: 'Borussia Dortmund', teamCode: 'BVB', league: 'ger.1', position: 'MF', jersey: 10, country: 'Germany', flag: '🇩🇪' },
    { name: 'Deniz Undav', team: 'VfB Stuttgart', teamCode: 'VFB', league: 'ger.1', position: 'FW', jersey: 26, country: 'Germany', flag: '🇩🇪' },
    { name: 'Ermedin Demirović', team: 'VfB Stuttgart', teamCode: 'VFB', league: 'ger.1', position: 'FW', jersey: 9, country: 'Bosnia', flag: '🇧🇦' },

    // --- Italian Serie A ---
    // Inter Milan
    { name: 'Lautaro Martínez', team: 'Inter Milan', teamCode: 'INT', league: 'ita.1', position: 'FW', jersey: 10, country: 'Argentina', flag: '🇦🇷' },
    { name: 'Marcus Thuram', team: 'Inter Milan', teamCode: 'INT', league: 'ita.1', position: 'FW', jersey: 9, country: 'France', flag: '🇫🇷' },
    { name: 'Nicolò Barella', team: 'Inter Milan', teamCode: 'INT', league: 'ita.1', position: 'MF', jersey: 23, country: 'Italy', flag: '🇮🇹' },
    { name: 'Hakan Çalhanoğlu', team: 'Inter Milan', teamCode: 'INT', league: 'ita.1', position: 'MF', jersey: 20, country: 'Turkey', flag: '🇹🇷' },
    { name: 'Alessandro Bastoni', team: 'Inter Milan', teamCode: 'INT', league: 'ita.1', position: 'DF', jersey: 95, country: 'Italy', flag: '🇮🇹' },

    // Juventus & AC Milan & Napoli & Roma
    { name: 'Dušan Vlahović', team: 'Juventus', teamCode: 'JUV', league: 'ita.1', position: 'FW', jersey: 9, country: 'Serbia', flag: '🇷🇸' },
    { name: 'Kenan Yıldız', team: 'Juventus', teamCode: 'JUV', league: 'ita.1', position: 'FW', jersey: 10, country: 'Turkey', flag: '🇹🇷' },
    { name: 'Rafael Leão', team: 'AC Milan', teamCode: 'MIL', league: 'ita.1', position: 'FW', jersey: 10, country: 'Portugal', flag: '🇵🇹' },
    { name: 'Christian Pulisic', team: 'AC Milan', teamCode: 'MIL', league: 'ita.1', position: 'FW', jersey: 11, country: 'USA', flag: '🇺🇸' },
    { name: 'Theo Hernández', team: 'AC Milan', teamCode: 'MIL', league: 'ita.1', position: 'DF', jersey: 19, country: 'France', flag: '🇫🇷' },
    { name: 'Khvicha Kvaratskhelia', team: 'Napoli', teamCode: 'NAP', league: 'ita.1', position: 'FW', jersey: 77, country: 'Georgia', flag: '🇬🇪' },
    { name: 'Romelu Lukaku', team: 'Napoli', teamCode: 'NAP', league: 'ita.1', position: 'FW', jersey: 11, country: 'Belgium', flag: '🇧🇪' },
    { name: 'Paulo Dybala', team: 'AS Roma', teamCode: 'ROM', league: 'ita.1', position: 'FW', jersey: 21, country: 'Argentina', flag: '🇦🇷' },

    // --- French Ligue 1 ---
    // Paris Saint-Germain
    { name: 'Ousmane Dembélé', team: 'Paris Saint-Germain', teamCode: 'PSG', league: 'fra.1', position: 'FW', jersey: 10, country: 'France', flag: '🇫🇷' },
    { name: 'Bradley Barcola', team: 'Paris Saint-Germain', teamCode: 'PSG', league: 'fra.1', position: 'FW', jersey: 29, country: 'France', flag: '🇫🇷' },
    { name: 'Warren Zaïre-Emery', team: 'Paris Saint-Germain', teamCode: 'PSG', league: 'fra.1', position: 'MF', jersey: 33, country: 'France', flag: '🇫🇷' },
    { name: 'Vitinha', team: 'Paris Saint-Germain', teamCode: 'PSG', league: 'fra.1', position: 'MF', jersey: 17, country: 'Portugal', flag: '🇵🇹' },
    { name: 'Achraf Hakimi', team: 'Paris Saint-Germain', teamCode: 'PSG', league: 'fra.1', position: 'DF', jersey: 2, country: 'Morocco', flag: '🇲🇦' },
    { name: 'Gianluigi Donnarumma', team: 'Paris Saint-Germain', teamCode: 'PSG', league: 'fra.1', position: 'GK', jersey: 1, country: 'Italy', flag: '🇮🇹' },

    // --- Major League Soccer (MLS) ---
    { name: 'Lionel Messi', team: 'Inter Miami', teamCode: 'MIA', league: 'usa.1', position: 'FW', jersey: 10, country: 'Argentina', flag: '🇦🇷' },
    { name: 'Luis Suárez', team: 'Inter Miami', teamCode: 'MIA', league: 'usa.1', position: 'FW', jersey: 9, country: 'Uruguay', flag: '🇺🇾' },
    { name: 'Sergio Busquets', team: 'Inter Miami', teamCode: 'MIA', league: 'usa.1', position: 'MF', jersey: 5, country: 'Spain', flag: '🇪🇸' },
    { name: 'Jordi Alba', team: 'Inter Miami', teamCode: 'MIA', league: 'usa.1', position: 'DF', jersey: 18, country: 'Spain', flag: '🇪🇸' },
    { name: 'Olivier Giroud', team: 'Los Angeles FC', teamCode: 'LAFC', league: 'usa.1', position: 'FW', jersey: 9, country: 'France', flag: '🇫🇷' },

    // --- Saudi Pro League ---
    { name: 'Cristiano Ronaldo', team: 'Al Nassr', teamCode: 'NAS', league: 'ksa.1', position: 'FW', jersey: 7, country: 'Portugal', flag: '🇵🇹' },
    { name: 'Sadio Mané', team: 'Al Nassr', teamCode: 'NAS', league: 'ksa.1', position: 'FW', jersey: 10, country: 'Senegal', flag: '🇸🇳' },
    { name: 'Neymar Jr', team: 'Al Hilal', teamCode: 'HIL', league: 'ksa.1', position: 'FW', jersey: 10, country: 'Brazil', flag: '🇧🇷' },
    { name: 'Aleksandar Mitrović', team: 'Al Hilal', teamCode: 'HIL', league: 'ksa.1', position: 'FW', jersey: 9, country: 'Serbia', flag: '🇷🇸' },
    { name: 'Rúben Neves', team: 'Al Hilal', teamCode: 'HIL', league: 'ksa.1', position: 'MF', jersey: 8, country: 'Portugal', flag: '🇵🇹' },
    { name: 'Karim Benzema', team: 'Al Ittihad', teamCode: 'ITT', league: 'ksa.1', position: 'FW', jersey: 9, country: 'France', flag: '🇫🇷' },
    { name: 'N\'Golo Kanté', team: 'Al Ittihad', teamCode: 'ITT', league: 'ksa.1', position: 'MF', jersey: 7, country: 'France', flag: '🇫🇷' },
    { name: 'Riyad Mahrez', team: 'Al Ahli', teamCode: 'AHL', league: 'ksa.1', position: 'FW', jersey: 7, country: 'Algeria', flag: '🇩🇿' },

    // --- Other European Giants & Stars ---
    { name: 'Viktor Gyökeres', team: 'Sporting CP', teamCode: 'SCP', league: 'por.1', position: 'FW', jersey: 9, country: 'Sweden', flag: '🇸🇪' },
    { name: 'Victor Osimhen', team: 'Galatasaray', teamCode: 'GAL', league: 'tur.1', position: 'FW', jersey: 45, country: 'Nigeria', flag: '🇳🇬' },
    { name: 'Mauro Icardi', team: 'Galatasaray', teamCode: 'GAL', league: 'tur.1', position: 'FW', jersey: 9, country: 'Argentina', flag: '🇦🇷' },
  ];

  function searchPlayers(query, extraPlayers, limit) {
    if (typeof limit !== 'number') limit = 24;
    var q = normalizeSearchText(query);
    if (!q) return [];

    var all = TOP_PLAYERS_DATA.concat(Array.isArray(extraPlayers) ? extraPlayers : []);
    var seen = new Set();
    var matches = [];

    for (var i = 0; i < all.length; i++) {
      var p = all[i];
      if (!p || !p.name) continue;
      var key = (p.name + ':' + (p.team || '')).toLowerCase();
      if (seen.has(key)) continue;

      var normName = normalizeSearchText(p.name);
      var normTeam = normalizeSearchText(p.team || '');
      var normCountry = normalizeSearchText(p.country || '');

      if (
        normName.indexOf(q) !== -1 ||
        normTeam.indexOf(q) !== -1 ||
        normCountry.indexOf(q) !== -1 ||
        q.indexOf(normName) !== -1
      ) {
        seen.add(key);
        matches.push(p);
        if (matches.length >= limit) break;
      }
    }

    return matches;
  }

  function searchCompetitions(query, leaguesList) {
    var q = normalizeSearchText(query);
    if (!q) return [];

    var list = Array.isArray(leaguesList) ? leaguesList : [];
    var seen = new Set();
    var results = [];

    for (var i = 0; i < list.length; i++) {
      var l = list[i];
      if (!l || !l.slug) continue;
      if (seen.has(l.slug)) continue;

      var normName = normalizeSearchText(l.name || '');
      var normCountry = normalizeSearchText(l.country || '');
      var normSlug = normalizeSearchText(l.slug || '');
      var normCode = normalizeSearchText(l.code || l.abbreviation || '');

      if (
        normName.indexOf(q) !== -1 ||
        normSlug.indexOf(q) !== -1 ||
        normCountry.indexOf(q) !== -1 ||
        normCode.indexOf(q) !== -1 ||
        q.indexOf(normName) !== -1
      ) {
        seen.add(l.slug);
        results.push(l);
      }
    }

    return results;
  }

  return {
    TOP_PLAYERS_DATA: TOP_PLAYERS_DATA,
    normalizeSearchText: normalizeSearchText,
    searchPlayers: searchPlayers,
    searchCompetitions: searchCompetitions,
  };
});
