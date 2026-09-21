const seedData = {
  admin: {
    name: 'Auctioneer Chief (Admin)',
    email: 'admin@auction.com',
    password: 'admin123',
    role: 'admin'
  },
  teams: [
    {
      name: 'Real Madrid CF',
      shortName: 'RMA',
      logo: '👑',
      color: '#F59E0B',
      budget: 150000000,
      maxPlayers: 11,
      managerUser: {
        name: 'Carlo Ancelotti',
        email: 'manager@madrid.com',
        password: 'madrid123',
        role: 'manager'
      }
    },
    {
      name: 'Manchester City',
      shortName: 'MCI',
      logo: '⚡',
      color: '#06B6D4',
      budget: 150000000,
      maxPlayers: 11,
      managerUser: {
        name: 'Pep Guardiola',
        email: 'manager@city.com',
        password: 'city123',
        role: 'manager'
      }
    },
    {
      name: 'Arsenal FC',
      shortName: 'ARS',
      logo: '🔴',
      color: '#EF4444',
      budget: 130000000,
      maxPlayers: 11,
      managerUser: {
        name: 'Mikel Arteta',
        email: 'manager@arsenal.com',
        password: 'arsenal123',
        role: 'manager'
      }
    },
    {
      name: 'Bayern Munich',
      shortName: 'BAY',
      logo: '🛡️',
      color: '#DC2626',
      budget: 140000000,
      maxPlayers: 11,
      managerUser: {
        name: 'Vincent Kompany',
        email: 'manager@bayern.com',
        password: 'bayern123',
        role: 'manager'
      }
    },
    {
      name: 'Paris Saint-Germain',
      shortName: 'PSG',
      logo: '🗼',
      color: '#3B82F6',
      budget: 160000000,
      maxPlayers: 11,
      managerUser: {
        name: 'Luis Enrique',
        email: 'manager@psg.com',
        password: 'psg123',
        role: 'manager'
      }
    },
    {
      name: 'FC Barcelona',
      shortName: 'BAR',
      logo: '🔵',
      color: '#A855F7',
      budget: 120000000,
      maxPlayers: 11,
      managerUser: {
        name: 'Hansi Flick',
        email: 'manager@barca.com',
        password: 'barca123',
        role: 'manager'
      }
    }
  ],
  players: [
    {
      name: 'Kylian Mbappé',
      age: 26,
      position: 'FWD',
      nationality: 'France',
      club: 'Real Madrid',
      basePrice: 30000000,
      stats: { pace: 97, shooting: 90, passing: 80, dribbling: 92, defending: 36, physical: 78, overall: 91 },
      photoUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&auto=format&fit=crop&q=80',
      orderIndex: 1
    },
    {
      name: 'Erling Haaland',
      age: 24,
      position: 'FWD',
      nationality: 'Norway',
      club: 'Manchester City',
      basePrice: 28000000,
      stats: { pace: 89, shooting: 93, passing: 70, dribbling: 80, defending: 45, physical: 88, overall: 91 },
      photoUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=80',
      orderIndex: 2
    },
    {
      name: 'Jude Bellingham',
      age: 22,
      position: 'MID',
      nationality: 'England',
      club: 'Real Madrid',
      basePrice: 25000000,
      stats: { pace: 80, shooting: 87, passing: 83, dribbling: 88, defending: 78, physical: 83, overall: 90 },
      photoUrl: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=500&auto=format&fit=crop&q=80',
      orderIndex: 3
    },
    {
      name: 'Vinícius Júnior',
      age: 24,
      position: 'FWD',
      nationality: 'Brazil',
      club: 'Real Madrid',
      basePrice: 24000000,
      stats: { pace: 95, shooting: 84, passing: 81, dribbling: 92, defending: 29, physical: 69, overall: 90 },
      photoUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=500&auto=format&fit=crop&q=80',
      orderIndex: 4
    },
    {
      name: 'Rodri',
      age: 28,
      position: 'MID',
      nationality: 'Spain',
      club: 'Manchester City',
      basePrice: 22000000,
      stats: { pace: 66, shooting: 80, passing: 86, dribbling: 84, defending: 87, physical: 85, overall: 91 },
      photoUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&auto=format&fit=crop&q=80',
      orderIndex: 5
    },
    {
      name: 'Kevin De Bruyne',
      age: 33,
      position: 'MID',
      nationality: 'Belgium',
      club: 'Manchester City',
      basePrice: 20000000,
      stats: { pace: 72, shooting: 87, passing: 94, dribbling: 87, defending: 65, physical: 74, overall: 90 },
      photoUrl: 'https://images.unsplash.com/photo-1489944445337-336718d7ff78?w=500&auto=format&fit=crop&q=80',
      orderIndex: 6
    },
    {
      name: 'Virgil van Dijk',
      age: 33,
      position: 'DEF',
      nationality: 'Netherlands',
      club: 'Liverpool',
      basePrice: 20000000,
      stats: { pace: 78, shooting: 60, passing: 71, dribbling: 72, defending: 89, physical: 86, overall: 89 },
      photoUrl: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=500&auto=format&fit=crop&q=80',
      orderIndex: 7
    },
    {
      name: 'Bukayo Saka',
      age: 23,
      position: 'FWD',
      nationality: 'England',
      club: 'Arsenal',
      basePrice: 18000000,
      stats: { pace: 86, shooting: 83, passing: 82, dribbling: 87, defending: 65, physical: 75, overall: 87 },
      photoUrl: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=500&auto=format&fit=crop&q=80',
      orderIndex: 8
    },
    {
      name: 'William Saliba',
      age: 23,
      position: 'DEF',
      nationality: 'France',
      club: 'Arsenal',
      basePrice: 18000000,
      stats: { pace: 82, shooting: 39, passing: 70, dribbling: 74, defending: 87, physical: 83, overall: 87 },
      photoUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500&auto=format&fit=crop&q=80',
      orderIndex: 9
    },
    {
      name: 'Thibaut Courtois',
      age: 32,
      position: 'GK',
      nationality: 'Belgium',
      club: 'Real Madrid',
      basePrice: 18000000,
      stats: { pace: 46, shooting: 89, passing: 74, dribbling: 88, defending: 48, physical: 88, overall: 89 },
      photoUrl: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=500&auto=format&fit=crop&q=80',
      orderIndex: 10
    },
    {
      name: 'Alphonso Davies',
      age: 24,
      position: 'DEF',
      nationality: 'Canada',
      club: 'Bayern Munich',
      basePrice: 15000000,
      stats: { pace: 95, shooting: 68, passing: 77, dribbling: 84, defending: 76, physical: 77, overall: 84 },
      photoUrl: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=500&auto=format&fit=crop&q=80',
      orderIndex: 11
    },
    {
      name: 'Lionel Messi',
      age: 37,
      position: 'FWD',
      nationality: 'Argentina',
      club: 'Inter Miami',
      basePrice: 15000000,
      stats: { pace: 79, shooting: 87, passing: 90, dribbling: 92, defending: 33, physical: 64, overall: 88 },
      photoUrl: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=500&auto=format&fit=crop&q=80',
      orderIndex: 12
    },
    {
      name: 'Cristiano Ronaldo',
      age: 40,
      position: 'FWD',
      nationality: 'Portugal',
      club: 'Al Nassr',
      basePrice: 12000000,
      stats: { pace: 77, shooting: 88, passing: 75, dribbling: 80, defending: 34, physical: 74, overall: 86 },
      photoUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=500&auto=format&fit=crop&q=80',
      orderIndex: 13
    },
    {
      name: 'Luka Modrić',
      age: 39,
      position: 'MID',
      nationality: 'Croatia',
      club: 'Real Madrid',
      basePrice: 10000000,
      stats: { pace: 72, shooting: 76, passing: 89, dribbling: 87, defending: 72, physical: 66, overall: 86 },
      photoUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=500&auto=format&fit=crop&q=80',
      orderIndex: 14
    },
    {
      name: 'Alisson Becker',
      age: 32,
      position: 'GK',
      nationality: 'Brazil',
      club: 'Liverpool',
      basePrice: 17000000,
      stats: { pace: 86, shooting: 85, passing: 85, dribbling: 89, defending: 54, physical: 90, overall: 89 },
      photoUrl: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=500&auto=format&fit=crop&q=80',
      orderIndex: 15
    },
    {
      name: 'Trent Alexander-Arnold',
      age: 26,
      position: 'DEF',
      nationality: 'England',
      club: 'Liverpool',
      basePrice: 16000000,
      stats: { pace: 76, shooting: 71, passing: 90, dribbling: 80, defending: 80, physical: 73, overall: 86 },
      photoUrl: 'https://images.unsplash.com/photo-1529764835860-239167e7c89f?w=500&auto=format&fit=crop&q=80',
      orderIndex: 16
    }
  ]
};

module.exports = seedData;
