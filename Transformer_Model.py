import torch
import torch.nn as nn
device = 'cuda' if torch.cuda.is_available() else 'cpu'

class TokenEmbedding(nn.Module):
  def __init__(self, num_vocab, maxlen, num_hid):
    super().__init__()
    self.emb = nn.Embedding(num_vocab, num_hid)
    self.pos_emb = nn.Embedding(maxlen, num_hid)
  
  def forward(self, x):
    maxlen = x.shape[-1]
    x = self.emb(x)
    positions = torch.arange(0, maxlen).to(device) #fix this
    positions = self.pos_emb(positions)
    return x + positions


class SpeechFeatureEmbedding(nn.Module):
  def __init__(self, num_hid):
    super().__init__()
    self.conv1 = nn.Conv1d(129, num_hid, 11, stride=2, padding=1)
    self.relu1 = nn.ReLU()
    self.conv2 = nn.Conv1d(num_hid, num_hid, 11, stride=2, padding=1)
    self.relu2 = nn.ReLU()
    self.conv3 = nn.Conv1d(num_hid, num_hid, 11, stride=2, padding=1)
    self.relu3 = nn.ReLU()
      
  def forward(self, x):
    x = self.relu1(self.conv1(x))
    x = self.relu2(self.conv2(x))
    return self.relu3(self.conv3(x))
  
class Encoder(nn.Module):
  def __init__(self, embed_dim, num_heads, feed_forward_dim, num_layers, rate=0.1):
    super().__init__()
    self.embedding = SpeechFeatureEmbedding(num_hid=embed_dim)
    encoder_layer = nn.TransformerEncoderLayer(embed_dim, nhead=num_heads, dim_feedforward=feed_forward_dim, activation='relu', dropout=rate, norm_first=True, batch_first=True)
    layer_norm = nn.LayerNorm(embed_dim)
    self.encoder = nn.TransformerEncoder(encoder_layer=encoder_layer, num_layers=num_layers, norm=layer_norm)

  def forward(self, x):
    x = self.embedding(x)
    x= x.permute(0,2,1)
    x = self.encoder(x)
    return x
  

def make_mask(batch, num_head, tgt_shape):
  mask = torch.full((batch*num_head,tgt_shape,tgt_shape), float('-inf'))
  return torch.triu(mask, diagonal=1)

class Decoder(nn.Module):
  def __init__(self, batch_size, num_classes, tgt_len, embed_dim, num_heads, feed_forward_dim, num_layers, rate=0.1):
    super().__init__()
    self.batch_size = batch_size
    self.num_heads = num_heads
    self.tgt_len = tgt_len
    self.embedding = TokenEmbedding(num_vocab=num_classes, maxlen=tgt_len, num_hid=embed_dim)
    self.mask = make_mask(batch_size, num_heads, tgt_len)
    layer_norm = nn.LayerNorm(embed_dim)
    decoder_layer = nn.TransformerDecoderLayer(embed_dim, num_heads, feed_forward_dim, batch_first=True, norm_first=True)
    self.decoder = nn.TransformerDecoder(decoder_layer, num_layers=num_layers, norm=layer_norm)

  def forward(self, enc_out, tgt, mask = 1):
    tgt = self.embedding(tgt)
    if(mask != None):
      if(self.batch_size != tgt.shape[0] or self.tgt_len != tgt.shape[1]):
        self.batch_size = tgt.shape[0]
        self.tgt_len = tgt.shape[1]
        self.mask = make_mask(self.batch_size, self.num_heads, self.tgt_len).to(device)
      x = self.decoder(tgt, enc_out, tgt_mask=self.mask)
    else:
      x = self.decoder(tgt, enc_out)
    return x
  

class Transformer(nn.Module):
    def __init__(self, batch_size=64, num_hid=200, num_head=2, num_feed_forward=400,
        target_maxlen=200, num_layers_enc=4, num_layers_dec=1, num_classes=34):
        super().__init__()
        self.num_layers_enc = num_layers_enc
        self.num_layers_dec = num_layers_dec
        self.target_maxlen = target_maxlen
        self.num_classes = num_classes

        self.encoder = Encoder(num_hid, num_head, num_feed_forward, num_layers_enc)
        self.decoder = Decoder(batch_size, num_classes, target_maxlen, num_hid, num_head, num_feed_forward, num_layers_dec)
        self.classifier = nn.Linear(num_hid, num_classes)

    def forward(self, x, target):
        x = self.encoder(x)
        y = self.decoder(x, target, 1)
        return self.classifier(y)