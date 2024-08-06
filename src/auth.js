import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import fs from 'fs'

const SECRET_KEY = fs.readFileSync(process.env.PRIVATE_KEY_FILE, 'utf8').trim()

// Fonction pour générer un token JWT
const generateToken = (payload) => {
  return jwt.sign(payload, SECRET_KEY, {
    algorithm: 'RS256'
  })
}

// Fonction pour vérifier l'authenticité d'un token JWT
const verifyTokenAuthenticity = async (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) reject(new Error('Invalid token.'))

      resolve(decoded)
    })
  })
}

// Fonction pour hacher un mot de passe
const hashPassword = async (password) => {
  const saltRounds = 10 // Nombre de "tour" du hachage (plus le nombre est élevé, plus c'est sécurisé mais plus c'est lent)
  const hash = await bcrypt.hash(password, saltRounds)

  return hash.toString()
}

// Fonction pour comparer les mots de passe
const comparePasswords = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword)
}

export default {
  generateToken,
  verifyTokenAuthenticity,
  hashPassword,
  comparePasswords
}
