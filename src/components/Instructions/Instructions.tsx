import {
  Box,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from '@chakra-ui/react';
import React from 'react';
import {
  CREATINE_EFFECT_DURATION,
  STEROID_EFFECT_DURATION,
} from '../../consts';
import { Effect } from './Effect';

interface InstructionsProps {
  onClose: () => any;
  isOpen: boolean;
}

export const Instructions: React.FC<InstructionsProps> = ({
  onClose,
  isOpen,
}) => {
  return (
    <Modal
      onClose={onClose}
      size='6xl'
      isOpen={isOpen}
      scrollBehavior='inside'
      returnFocusOnClose={false}
      autoFocus={false}
      isCentered
    >
      <ModalOverlay />
      <ModalContent
        bg='primary.main'
        color='white'
        boxShadow='lg'
        borderRadius='md'
        border='1px solid #ffffff0a'
      >
        <ModalHeader fontSize='3xl'>Instructions</ModalHeader>
        <ModalCloseButton _active={{}} _focus={{}} />

        <ModalBody
          css={`
            ::-webkit-scrollbar-track {
              -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
              border-radius: 10px;
            }

            ::-webkit-scrollbar {
              width: 14px;
              // background-color: #171717;
              background-color: black;
              border-left: 1px solid #3a3232;
            }

            ::-webkit-scrollbar-thumb {
              border-radius: 10px;
              -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
              background-color: #171717;
            }
          `}
        >
          <Text mb={2}>Basic instrucions for snake game</Text>
          <Box>
            <Heading fontSize='2xl' mb={6}>
              Effects
            </Heading>
            <Text style={{ textIndent: '12px' }} mb={4}>
              There are 4 types of food currently available in this game. Both
              of those are passive (protein powder and meat) which means they
              don't cause any effect or side-effect and other 2 that cause
              effect and side-effect (steroid and creatine). A brief explanation
              for each food type is provided bellow:
            </Text>
            <VStack alignItems='flex-start' spacing={8}>
              <Effect
                food='protein'
                rules={[
                  '- snake grows for 1 cell',
                  `- <b>Effect:</b> N/A`,
                  `- <b>Side-effect:</b> N/A`,
                  `- <b>Duration:</b> ∞`,
                  `- <b>Immunity:</b> N/A`,
                ]}
              />
              <Effect
                food='meat'
                rules={[
                  '- snake grows for 1 cell',
                  `- <b>Effect:</b> N/A`,
                  `- <b>Side-effect:</b> N/A`,
                  `- <b>Duration:</b> ∞`,
                  `- <b>Immunity:</b> N/A`,
                ]}
              />
              <Effect
                food='creatine'
                rules={[
                  '- snake grows for 1 cell',
                  `- <b>Effect:</b> snake is hyped that it consumed creatine for first time and goes in reverse mode `,
                  `- <b>Side-effect:</b> if creatine is not consumed in the next ${CREATINE_EFFECT_DURATION} seconds it reverses again`,
                  `- <b>Duration:</b> ${CREATINE_EFFECT_DURATION} seconds`,
                  `- <b>Immunity:</b> if snake is under consumtion of steroids, the effects and side-effects from creatine don't affect the snake`,
                ]}
              />
              <Effect
                food='steroid'
                rules={[
                  '- snake grows for 2 cell',
                  `- <b>Effect</b>: snake grows double the time, but with serious side-effects`,
                  `- <b>Side-effect</b>: if steroid is not consumed in the next ${STEROID_EFFECT_DURATION} seconds the snake shrinks for 3 cells and hair falls`,
                  `- <b>Duration:</b> ${STEROID_EFFECT_DURATION} seconds`,
                  `- <b>Immunity</b>: if snake is under consumtion of steroids, the effects and side-effects from other food types don't affect the snake`,
                ]}
              />
            </VStack>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
