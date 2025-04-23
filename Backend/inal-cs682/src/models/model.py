# Written by Inal Mashukov
# for CS 682
# University of Massachusetts Boston

import tensorflow as tf 
from tensorflow import keras 


class PricePredictionModel(tf.keras.Model):

    '''
    Feed-Forward Neural Network (MLP) regressor class for property price prediction.

    Recall that an MLP is a collection of layers described by the function: z = sigma(y) = sigma(Wx + b),
    where :
        - W is the weights matrix, 
        - x is the input vector
        - b is the bias vector 
        - sigma is the activation function
        - z is the output vector

    
    Args:

        - n_layers: number of hidden layers in the MLP
        - eps_norm: layer normalization term 
        (added to the variance to prevent division by zero and to maintain numerical stability during the normalization process.)
        - n_neurons: number of neurons in the hidden layers 
        - activation: the hidden layer activation function
        - l2_reg: the L2 regularization term 
        - dropout: the dropout rate 

    '''

    def __init__(self, n_layers: int = 4, eps_norm: float=1e-6,
                 n_neurons: int = 1024, activation: str = 'relu', 
                 l2_reg: float = 0.01, dropout: float = 0.1):
        super(PricePredictionModel, self).__init__()

        # self.n_features = n_features
        self.n_layers = n_layers
        self.eps_norm = eps_norm
        self.n_neurons = n_neurons
        self.activation = activation
        self.l2_reg = l2_reg 
        self.dropout = dropout

        # Feed forward layers:

        self.input_layer = keras.layers.Dense(units = n_neurons, 
                                              activation = activation)
        self.hidden_layers = []

        for _ in range(n_layers):
            self.hidden_layers.append(keras.layers.LayerNormalization(epsilon = eps_norm))
            self.hidden_layers.append(keras.layers.Dense(units = n_neurons,
                                                   activation = activation,
                                  kernel_regularizer = keras.regularizers.l2(l2_reg)))
            self.hidden_layers.append(keras.layers.Dropout(rate = dropout))


        self.output_layer = keras.layers.Dense(units = 1, 
                                               kernel_regularizer = 
                                               keras.regularizers.l2(l2_reg))

    def call(self, inputs):

        '''
        call() method passes the inputs through the network layers:
        1. Start with input layer,
        2. Pass through the hidden layers, 
        3. Get the final layer (with a single neuron - the single predicted value)
        '''

        x = self.input_layer(inputs)

        for layer in self.hidden_layers:
            x = layer(x)

        output = self.output_layer(x)

        return output