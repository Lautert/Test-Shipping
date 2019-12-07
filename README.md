## Finalidade do Repositório

Este é um repositório de teste para entrevista.

==========================================================
### Test Request

We need to create a solution for the online shop cart.
Shipping rules

All shipping calculations are made over the subtotal WITHOUT the shipping costs and WITHOUT any discounts.

- For purchases above R$400.00 the shipping is free!
- For purchases bellow or equal 10kg the shipping price is: $30.
- Each 5kg above 10kg will add $7 to the shipping price.

The system should support these kinds of coupons

- Percentual coupon: are coupons that reduce an amount in percentage of the cost on subtotal.
- Fixed coupon: are coupons with fixed amounts that should reduce over the TOTAL.
- Free Shipping: make the shipping price become 0 when applied, and should have a minimum subtotal requirement

Enabled Coupons

- A: percentual coupon of 30%
- FOO: fixed coupon of $100.00
- C: free shipping coupon with minimum value of $300.50

Available Products

- Banana, price: $10 per kg
- Apple, $20 per kg
- Orange, $30 per kg

FRONTEND

You can use CONSTANTS to define COUPONS and PRODUCTS available.

Try to perform all calculations in real-time without any server request. Take care with validations and build a face interface if you can. Please use this wireframe as a guide:

==========================================================

## Caso queira alterar a parte do html
### Recursos necessarios

- Node
- NPM

#### Antes de desenvolver

- Ir na pasta do projeto e rodar `npm install`

#### Usando o Grunt

O sistema esta usando o *Grunt* para auto compilar os arquivos LESS e SCSS.

É necessario que o serviço do grunt sempre esteja rodando para "observar" alterações nos arquivos `.less` e `.scss`, das pastas `public/build/less` e `public/build/sass`.

Para isso :

- Ir na pasta do projeto e executar `grunt`

Não alterar diretamente os arquivos

- `style-less.css`
- `style-less.min.css`
- `style-sass.css`
- `style-sass.min.css`

pois esta são gerados pelo grunt, qualquer alteração neles será perdida,
quando o grunt for rodado.

================================================================

Da mesma forma esta usando `grunt uglify` para gerir os arquivos JS.
Assim gerando um unico arquivo js e caso necessario minificado.

É necessario que o serviço do grunt sempre esteja rodando para "observar" alterações nos arquivos `.js`, da pasta `public/build/js`.  
E prensetes na lista de compactação do `Gruntfile.js`