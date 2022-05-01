//Importação de módulos
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const path = require('path')
const app = express()
const Usuario = require('./model/usuario')

const JWT_SECRET = 'aksdnjlaisfub2398bp340q89tb-2t4b8f!$%¨&*I!NKUHYBLK<kIUYUTFC!@$0O*!Y@I$U#()!*@$&'

//Conexão com o banco de dados
mongoose.connect('mongodb://localhost:27017/banco-tcc', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

/*Define que a página raiz será a que está na pasta static*/
app.use('/', express.static(path.join(__dirname, 'static')))
app.use(express.json());

app.post('/api/mudar-senha', async (req, res)=>{
    /*Recebe o token da rota /mudar-senha e armazena numa variável de mesmo nome*/
    const {token, novaSenha: textoSenha} = req.body
    try{
        /*Testa se a senha é válida verificando se não é vazia ou se não é do tipo String e responde com um json informando o erro */
        if(!textoSenha || typeof textoSenha !== 'string'){
            return res.json({status: 'erro', erro: 'Senha inválida!'})
        }
        /*Testa se a senha tem ao menos 6 caractéres de tamanho por fins de segurança*/
        if(textoSenha.length <=  5){
            return res.json({status: 'erro', erro:'Senha muito pequena! Insira uma senha de pelo menos 6 caractéres.'})
        }
        /*Verifica se o token recebido, decodificado com o hash é um token válido. Caso seja, o token é //decodificado e armazenado na variável user, tendo como alberson o _id do usuário e seu nome, //que serão posteriormente utilizados para realizar a query que alterará a senha no banco de dados*/
        const user = jwt.verify(token, JWT_SECRET)
        const _id = user.id
        const senha = await bcrypt.hash(textoSenha, 10)
        await Usuario.updateOne({_id},{
            $set : {senha}
        })
        res.json({status: 'ok'})
    }catch(err){
        res.json({status: 'erro', erro: err})
    }
})

/*Receve da rota /api/login a resquisição feita e realiza testes para a realização do login*/
app.post('/api/login', async(req, res) =>{
    /*Recebe o email e a senha digitados no formulário da rota /login e realiza uma query no banco de dados pelo usuário cujo email seja o mesmo da variável email*/
    const {email, senha} = req.body
    const user = await Usuario.findOne({email}).lean()

    /*Caso não haja um usuário com o nome digitado, envia uma resposta para a rota informando o erro*/
    if(!user){
        return res.json({status: 'erro', erro: 'Nome/Senha inválidos!'})
    }

    /*Caso o usuário seja encontrado, sua senha criptografada é comparada com a senha digitada no formulário e assim, é realizado um teste.*/
    if(await bcrypt.compare(senha, user.senha)){
        /*Caso a senha seja a mesma, é criado um token, a partir do módulo jwt, que codifica, com base em um hash definido préviamente, o id do usuário e seu nome. Após isso, responde com um status de 'ok' e com os dados sendo o valor do token codificado*/
        const token = jwt.sign({
            id: user._id, 
            email: user.email
        }, JWT_SECRET)
        return res.json({status: 'ok', dados: token})
    }
    res.json({status: 'erro', erro: 'Nome/Senha inválidos!'})
})


/*Recebe da rota /api/register a requisição feita e trata seus dados*/
app.post('/api/registrar', async(req, res)=>{
    /*Recebe os valores da requisição e os atribui às variáveis usuario e textoSenha*/
    const {usuario, email, senha: textoSenha, telefone, cpf} = req.body

    /*Testa se o nome de usuário é válido verificando se não é vazio ou se não é do tipo String e responde com um json informando o erro */
    if(!usuario || typeof usuario !== 'string'){
         return res.json({status: 'erro', erro: 'Nome de usuário inválido!'})
     }
    /*Testa se a senha é válida verificando se não é vazia ou se não é do tipo String e responde com um json informando o erro */
    if(!textoSenha || typeof textoSenha !== 'string'){
        return res.json({status: 'erro', erro: 'Senha inválida!'})
    }
    /*Testa se a senha tem ao menos 6 caractéres de tamanho por fins de segurança*/
    if(textoSenha.length <=  5){
        return res.json({status: 'erro', erro:'Senha muito pequena! Insira uma senha de pelo menos 6 caractéres.'})
    }
    /*Criptografa a senha enviada pela requisição e atribui a senha criptografada para a variável senha*/
    const senha = await bcrypt.hash(textoSenha, 10)
    /*Realiza a inserção no banco de dados do nome e senha do usuário já tratados*/
    try{
        const resposta = await Usuario.create({
            usuario,
            email,
            senha,
            telefone,
            cpf
        })
        console.log('Usuário criado com sucesso!', resposta)
    }catch(err){
        if(err.code === 11000){
            //Email duplicado
            return res.json({status: 'erro', erro: 'Email já utilizado!'})
        }
        throw err
    }
    /*Caso não hajam erros, responde com um sinal de OK*/
    res.json({status: 'ok'})
})

/*Define a porta e estabelece a conexão com o servidor*/
const port = 8081
app.listen(port, () =>{
    console.log(`Server rodando na porta ${port}!`)
})
