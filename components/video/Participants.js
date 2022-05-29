import {Button, Icon} from '@rneui/base';
import React from 'react';
import {View, Text} from 'react-native';

export default function Participants({
  memberList,
  onMemberUpdate = () => {},
  mod = false,
}) {
  if (!mod)
    return (
      <View>
        {memberList.map(m => (
          <Text key={m.id}>{m.name}</Text>
        ))}
      </View>
    );

  return (
    <View style={{width: '90%'}}>
      <Text style={{fontWeight: 'bold', fontSize: 20}}>Participants</Text>
      {memberList
        .sort((a, b) => (a?.name ?? '').localeCompare(b?.name ?? ''))
        .map(member => (
          <View
            key={member.id}
            style={{
              display: 'flex',
              flexDirection: 'row',
            }}>
            <Text style={{padding: 10, flex: 1, fontWeight: 'bold'}}>
              {member.name + ' '}
            </Text>

            <View style={{dislay: 'flex', flexDirection: 'row'}}>
              <Button
                color={!member.audio_muted ? 'primary' : 'error'}
                onPress={() => {
                  member.audio_muted
                    ? onMemberUpdate({
                        action: 'unmute_audio',
                        id: member.id,
                      })
                    : onMemberUpdate({
                        action: 'mute_audio',
                        id: member.id,
                      });
                }}>
                {!member.audio_muted ? (
                  <Icon type="material" name="mic" size={16} color="white" />
                ) : (
                  <Icon
                    type="material"
                    name="mic-off"
                    size={16}
                    color="white"
                  />
                )}
              </Button>

              <Button
                // style={{padding: '2px 5px', marginLeft: 1}}
                color={!member.video_muted ? 'primary' : 'error'}
                onPress={() => {
                  member.video_muted
                    ? onMemberUpdate({
                        action: 'unmute_video',
                        id: member.id,
                      })
                    : onMemberUpdate({
                        action: 'mute_video',
                        id: member.id,
                      });
                }}>
                {!member.audio_muted ? (
                  <Icon
                    type="material"
                    name="videocam"
                    size={16}
                    color="white"
                  />
                ) : (
                  <Icon
                    type="material"
                    name="videocam-off"
                    size={16}
                    color="white"
                  />
                )}
              </Button>

              <Button
                color="error"
                onPress={() => {
                  onMemberUpdate({action: 'remove', id: member.id});
                }}>
                <Icon name="call-end" type="material" size={16} color="white" />
              </Button>
            </View>
          </View>
        ))}
    </View>
  );
}

//   return (
//     <Card style={{width: '100%'}}>
//       <Card.Header>Participants</Card.Header>
//       <ListGroup variant="flush">
//         {memberList
//           .sort((a, b) => (a?.name ?? '').localeCompare(b?.name ?? ''))
//           .map(member => (
//             <ListGroup.Item key={member.id} style={{padding: '2px 0'}}>
//               <Container>
//                 <Row>
//                   <Col
//                     style={{
//                       display: 'flex',
//                       alignItems: 'center',
//                     }}>
//                     {member.name + ' '}
//                   </Col>

//                   <Col md="auto">
//                       <Button
//                         style={{padding: '2px 5px', marginLeft: 1}}
//                         variant={!member.audio_muted ? 'success' : 'danger'}
//                         onClick={() => {
//                           member.audio_muted
//                             ? onMemberUpdate({
//                                 action: 'unmute_audio',
//                                 id: member.id,
//                               })
//                             : onMemberUpdate({
//                                 action: 'mute_audio',
//                                 id: member.id,
//                               });
//                         }}>
//                         {!member.audio_muted ? <MdMic /> : <MdMicOff />}
//                       </Button>

//                       <Button
//                         style={{padding: '2px 5px', marginLeft: 1}}
//                         variant={!member.video_muted ? 'success' : 'danger'}
//                         onClick={() => {
//                           member.video_muted
//                             ? onMemberUpdate({
//                                 action: 'unmute_video',
//                                 id: member.id,
//                               })
//                             : onMemberUpdate({
//                                 action: 'mute_video',
//                                 id: member.id,
//                               });
//                         }}>
//                         {!member.video_muted ? (
//                           <MdVideocam />
//                         ) : (
//                           <MdVideocamOff />
//                         )}
//                       </Button>

//                       <Button
//                         style={{padding: '2px 5px', marginLeft: 1}}
//                         variant="danger"
//                         onClick={() => {
//                           onMemberUpdate({action: 'remove', id: member.id});
//                         }}>
//                         <MdCallEnd />
//                       </Button>
//                   </Col>
//                 </Row>
//               </Container>
//             </ListGroup.Item>
//           ))}
//       </ListGroup>
//     </Card>
//   );
