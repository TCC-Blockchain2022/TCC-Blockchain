const generatePDF = async(name)=>{
    const {PDFDocument, rgb} = PDFLib;

    const exBytes = await fetch("./cert.pdf").then((res)=> 
    {
        return res.arrayBuffer();
    });

    const exFont =  await fetch("./Sanchez-Regular.ttf").then(res=>{
        return res.arrayBuffer();

    })
    
    

    


    const pdfDoc = await PDFDocument.load(exBytes);

    pdfDoc.registerFontkit(fontkit);
    const myFont = await pdfDoc.embedFont(exFont);

    const pages = pdfDoc.getPages();
    const firstPg = pages[0]

    firstPg.drawText(name,{
        x: 100,
        y: 300,
        size: 58,
        font: myFont,
        color: rgb(0,0,0)

    })

    const uri = await pdfDoc.saveAsBase64({dataUri: true})

    saveAs(uri, `Certificado de ${name}.pdf`, {autoBon : true})
    //document.querySelector("#mypdf").src = uri;

};

const botaoEnviar = document.getElementById('gerar')
const nomeCertificado = document.querySelector('#nome')

botaoEnviar.addEventListener('click', ()=>{
    const val = nomeCertificado.value
    generatePDF(val)
})

